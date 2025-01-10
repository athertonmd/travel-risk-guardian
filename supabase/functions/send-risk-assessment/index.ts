import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  to: string;
  cc?: string[];
  country: string;
  risk_level: string;
  information: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const body = await req.json();
    const { to, cc, country, risk_level, information, user_id } = body as RequestBody;

    if (!to || !country || !risk_level || !information || !user_id) {
      throw new Error('Missing required fields');
    }

    console.log('Creating email log entry for:', { to, cc, country, risk_level, user_id });

    // Create email log entry with pending status
    const { data: logData, error: logError } = await supabase
      .from('email_logs')
      .insert([{
        recipient: to,
        cc,
        country,
        risk_level,
        sent_by: user_id,
        status: 'pending',
        sent_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
      throw new Error(`Failed to create email log: ${logError.message}`);
    }

    if (!logData) {
      throw new Error('Failed to create email log: No data returned');
    }

    // Generate email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Risk Assessment Report</h2>
        <div style="margin: 20px 0;">
          <h3 style="color: #555;">Country: ${country}</h3>
          <p style="background-color: ${getRiskColor(risk_level)}; color: white; padding: 10px; border-radius: 5px; display: inline-block;">
            Risk Level: ${risk_level.toUpperCase()}
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h4 style="color: #444;">Assessment Details:</h4>
          <p style="color: #666; line-height: 1.6;">${information}</p>
        </div>
        <div style="margin-top: 20px; font-size: 0.9em; color: #888;">
          <p>This is an automated risk assessment notification.</p>
        </div>
      </div>
    `;

    console.log('Preparing email payload with recipient:', to, 'and CC:', cc);

    // Prepare email payload
    const emailPayload: {
      from: string;
      to: string[];
      cc?: string[];
      subject: string;
      html: string;
    } = {
      from: 'Travel Risk Guardian <onboarding@resend.dev>',
      to: [to],
      subject: `Risk Assessment - ${country}`,
      html,
    };

    // Add CC recipients if they exist and are not empty
    if (cc && Array.isArray(cc) && cc.length > 0) {
      emailPayload.cc = cc;
      console.log('Added CC recipients:', cc);
    }

    console.log('Final email payload:', emailPayload);

    // Send email using Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const emailData = await emailRes.json();
    console.log('Resend API response:', emailData);

    if (!emailRes.ok) {
      // Update log with failed status
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: emailData.message || 'Failed to send email'
        })
        .eq('id', logData.id);

      if (updateError) {
        console.error('Error updating email log status to failed:', updateError);
      }

      throw new Error(emailData.message || 'Failed to send email');
    }

    console.log('Email sent successfully:', emailData);

    // Update log with success status
    const { error: updateError } = await supabase
      .from('email_logs')
      .update({
        status: 'sent',
        error_message: null
      })
      .eq('id', logData.id);

    if (updateError) {
      console.error('Error updating email log status to sent:', updateError);
    }

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in send-risk-assessment function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || "An error occurred while processing your request"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'extreme':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#eab308';
    case 'low':
      return '#22c55e';
    default:
      return '#6b7280';
  }
}