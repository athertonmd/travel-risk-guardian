import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { EmailData, EmailLogEntry } from "./types.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function createEmailLog(supabase: any, logData: EmailLogEntry) {
  const { data: logEntry, error: logError } = await supabase
    .from('email_logs')
    .insert([logData])
    .select()
    .single();

  if (logError) {
    console.error('Error creating email log:', logError);
    throw new Error('Failed to create email log');
  }

  return logEntry;
}

async function sendEmailWithResend(to: string[], subject: string, html: string) {
  console.log('Sending email to:', to);
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Travel Risk Guardian <notifications@tripguardian.corpanda.com>',
      to,
      subject,
      html,
      reply_to: 'notifications@tripguardian.corpanda.com'
    }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error('Resend API error:', data);
    throw new Error(data.message || 'Failed to send email');
  }

  return { success: true, data };
}

async function updateEmailLog(supabase: any, logId: string, status: {
  recipient_status: string;
  recipient_error_message?: string | null;
  cc_status?: string | null;
  cc_error_message?: string | null;
}) {
  const { error } = await supabase
    .from('email_logs')
    .update(status)
    .eq('id', logId);

  if (error) {
    console.error('Error updating email log:', error);
  }
}

async function sendCCEmail(emailData: EmailData, primaryRecipient: string) {
  if (emailData.to.length <= 1) return null;

  const ccRecipients = emailData.to.slice(1);
  const ccHtml = `
    <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
      <p style="margin: 0; color: #666;">This email was sent as a CC. The primary recipient is: <strong>${primaryRecipient}</strong></p>
      <p style="margin: 5px 0 0; color: #666;">Risk assessment details below:</p>
    </div>
    ${emailData.html}
  `;

  try {
    return await sendEmailWithResend(
      ccRecipients,
      `${emailData.subject} (CC to: ${primaryRecipient})`,
      ccHtml
    );
  } catch (error) {
    console.error('Error sending CC email:', error);
    return { success: false, error };
  }
}

export async function sendEmail(emailData: EmailData, logData: EmailLogEntry): Promise<Response> {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create initial log entry
    const logEntry = await createEmailLog(supabase, logData);

    // Send primary email
    const primaryResult = await sendEmailWithResend(
      [emailData.to[0]],
      emailData.subject,
      emailData.html
    );

    // Send CC email if needed
    const ccResult = await sendCCEmail(emailData, emailData.to[0]);

    // Update log with results
    await updateEmailLog(supabase, logEntry.id, {
      recipient_status: primaryResult.success ? 'sent' : 'failed',
      recipient_error_message: !primaryResult.success ? JSON.stringify(primaryResult.error) : null,
      cc_status: ccResult ? (ccResult.success ? 'sent' : 'failed') : null,
      cc_error_message: ccResult?.error ? JSON.stringify(ccResult.error) : null,
    });

    return new Response(JSON.stringify(primaryResult.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in sendEmail:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Failed to send email. Check the Edge Function logs for more details."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}