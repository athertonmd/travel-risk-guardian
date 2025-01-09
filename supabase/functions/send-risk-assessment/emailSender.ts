import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
}

interface LogData {
  recipient: string;
  cc: string[] | null;
  country: string;
  risk_level: string;
  sent_by: string;
  status: 'pending' | 'sent' | 'failed';
}

export async function sendEmail(emailData: EmailData, logData: LogData): Promise<Response> {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, create the email log entry with pending status
    const { error: logError } = await supabase
      .from('email_logs')
      .insert([{
        ...logData,
        status: 'pending',
      }]);

    if (logError) {
      console.error('Error creating email log:', logError);
      throw new Error('Failed to create email log');
    }

    // Send email using Resend with the temporary resend.dev domain
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        ...emailData,
        from: 'Travel Risk Guardian <onboarding@resend.dev>', // Using resend.dev domain temporarily
      }),
    });

    const responseData = await res.json();
    console.log('Resend API response:', responseData);

    if (!res.ok) {
      // Update log with failed status
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: responseData.message || 'Failed to send email',
        })
        .eq('recipient', logData.recipient)
        .eq('status', 'pending');

      throw new Error(responseData.message || 'Failed to send email');
    }

    // Update log with success status
    await supabase
      .from('email_logs')
      .update({
        status: 'sent',
      })
      .eq('recipient', logData.recipient)
      .eq('status', 'pending');

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in sendEmail:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Make sure RESEND_API_KEY is configured and you're using the resend.dev domain for testing"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}