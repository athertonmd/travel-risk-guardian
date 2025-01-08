import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RiskAssessment {
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  amended_by: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { assessments, userId } = await req.json()

    if (!assessments || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing assessments or user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Clean and format the assessments
    const formattedAssessments = assessments
      .filter((assessment: any) => assessment.country && assessment.assessment)
      .map((assessment: any) => ({
        country: assessment.country.trim(),
        assessment: assessment.assessment.toLowerCase().trim(),
        information: assessment.information?.trim() || '',
        amended_by: userId
      }))

    // Insert the assessments in batches of 50
    const batchSize = 50
    const results = []
    
    for (let i = 0; i < formattedAssessments.length; i += batchSize) {
      const batch = formattedAssessments.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert(batch)
        .select()

      if (error) {
        console.error('Batch insert error:', error)
        throw error
      }

      results.push(...(data || []))
    }

    return new Response(
      JSON.stringify({ 
        message: 'Risk assessments uploaded successfully',
        count: results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Process assessments error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})