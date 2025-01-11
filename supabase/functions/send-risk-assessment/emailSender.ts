import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { EmailData, EmailLogEntry } from "./types.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function sendEmail(emailData: EmailData, logData: EmailLogEntry): Promise<Response> {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create email log entry with pending status
    const { data: logEntry, error: logError } = await supabase
      .from('email_logs')
      .insert([logData])
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
      throw new Error('Failed to create email log');
    }

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        ...emailData,
        from: 'Travel Risk Guardian <onboarding@resend.dev>',
      }),
    });

    const responseData = await res.json();
    console.log('Resend API response:', responseData);

    if (!res.ok) {
      // Update log with failed status for both recipient and CC
      await supabase
        .from('email_logs')
        .update({
          recipient_status: 'failed',
          recipient_error_message: responseData.message || 'Failed to send email',
          cc_status: logData.cc ? 'failed' : null,
          cc_error_message: logData.cc ? (responseData.message || 'Failed to send email') : null,
        })
        .eq('id', logEntry.id);

      throw new Error(responseData.message || 'Failed to send email');
    }

    // Update log with success status for both recipient and CC
    await supabase
      .from('email_logs')
      .update({
        recipient_status: 'sent',
        cc_status: logData.cc ? 'sent' : null,
      })
      .eq('id', logEntry.id);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in sendEmail:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Make sure RESEND_API_KEY is configured correctly"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}