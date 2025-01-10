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

    const { to, cc, country, risk_level, information, user_id } = await req.json() as RequestBody;

    console.log('Creating email log entry for:', { to, country, risk_level, user_id });

    // Create email log entry with pending status
    const { error: logError } = await supabase
      .from('email_logs')
      .insert([{
        recipient: to,
        cc,
        country,
        risk_level,
        sent_by: user_id,
        status: 'pending'
      }]);

    if (logError) {
      console.error('Error creating email log:', logError);
      throw new Error('Failed to create email log');
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

    console.log('Sending email to:', to);

    // Send email using Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Travel Risk Guardian <onboarding@resend.dev>',
        to: [to],
        ...(cc && cc.length > 0 && { cc }),
        subject: `Risk Assessment - ${country}`,
        html,
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      // Update log with failed status
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: emailData.message || 'Failed to send email',
        })
        .eq('recipient', to)
        .eq('status', 'pending');

      throw new Error(emailData.message || 'Failed to send email');
    }

    console.log('Email sent successfully:', emailData);

    // Update log with success status
    await supabase
      .from('email_logs')
      .update({
        status: 'sent',
      })
      .eq('recipient', to)
      .eq('status', 'pending');

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in send-risk-assessment function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "An error occurred while processing your request"
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