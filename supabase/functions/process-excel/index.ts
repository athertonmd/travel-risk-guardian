import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const validRiskLevels = ['low', 'medium', 'high', 'extreme'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Validate and sanitize the Excel data structure
    const validRows = []
    const errors = []

    for (const row of data) {
      try {
        // Basic validation
        if (!row.Country || !row.Assessment || !row.Information) {
          errors.push(`Invalid row: missing required fields`)
          continue
        }

        // Sanitize the assessment value
        const sanitizedAssessment = row.Assessment.toString().toLowerCase().trim()
        
        // Validate risk level
        if (!validRiskLevels.includes(sanitizedAssessment)) {
          errors.push(`Invalid risk level: "${sanitizedAssessment}". Must be one of: ${validRiskLevels.join(', ')}`)
          continue
        }

        validRows.push({
          country: row.Country.toString().trim(),
          assessment: sanitizedAssessment,
          information: row.Information.toString().trim(),
          amended_by: userId
        })
      } catch (error) {
        console.error('Row processing error:', error)
        errors.push(`Failed to process row: ${error.message}`)
      }
    }

    if (validRows.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid rows found in Excel file', 
          details: errors.join('; ')
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { error } = await supabase
      .from('risk_assessments')
      .insert(validRows)

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to insert assessments', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Assessments uploaded successfully',
        count: validRows.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Process excel error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})