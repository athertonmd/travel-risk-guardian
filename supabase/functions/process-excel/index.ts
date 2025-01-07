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
    const validRows = data.filter(row => {
      // Basic validation
      const isValid = row.Country && 
                     row.Assessment && 
                     typeof row.Assessment === 'string' &&
                     row.Information;
      
      if (!isValid) {
        console.error('Invalid row:', row);
      }
      return isValid;
    });

    if (validRows.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Excel format', 
          details: 'Excel file must contain columns: Country, Assessment, and Information' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const assessments = validRows.map((row: any) => {
      // Sanitize the assessment value: trim spaces and convert to lowercase
      const sanitizedAssessment = row.Assessment.toString().toLowerCase().trim();
      
      // Validate that the assessment is a valid risk level
      if (!validRiskLevels.includes(sanitizedAssessment)) {
        throw new Error(`Invalid risk level: ${sanitizedAssessment}. Must be one of: ${validRiskLevels.join(', ')}`);
      }

      return {
        country: row.Country.trim(),
        assessment: sanitizedAssessment,
        information: row.Information.trim(),
        amended_by: userId
      };
    });

    const { error } = await supabase
      .from('risk_assessments')
      .insert(assessments)

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to insert assessments', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Assessments uploaded successfully',
        count: assessments.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Process excel error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})