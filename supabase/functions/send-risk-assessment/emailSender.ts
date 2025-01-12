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

async function sendEmailWithResend(emailPayload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to: string;
}) {
  console.log('Sending email with payload:', emailPayload);
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  
  const startTime = Date.now();
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const responseData = await res.json();
    const endTime = Date.now();
    console.log(`Email sent in ${endTime - startTime}ms. Response:`, responseData);

    if (!res.ok) {
      console.error('Resend API error response:', responseData);
      throw new Error(responseData.message || 'Failed to send email');
    }

    return { success: true, data: responseData };
  } catch (error) {
    const endTime = Date.now();
    console.error(`Email sending failed after ${endTime - startTime}ms:`, error);
    throw error;
  }
}

async function sendEmails(emailData: EmailData) {
  const startTime = Date.now();
  console.log('Starting batch email send at:', new Date().toISOString());

  const baseEmailPayload = {
    from: 'Travel Risk Guardian <send@tripguardian.corpanda.com>',
    reply_to: 'support@tripguardian.corpanda.com',
    subject: emailData.subject,
  };

  // Prepare all email payloads
  const emailPayloads = [];

  // Primary recipient
  emailPayloads.push({
    ...baseEmailPayload,
    to: [emailData.to[0]],
    html: emailData.html,
  });

  // CC recipients (if any)
  if (emailData.to.length > 1) {
    const ccHtml = `
      <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0; color: #666;">This email was sent as a CC. The primary recipient is: <strong>${emailData.to[0]}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment for traveller: <strong>${emailData.travellerName || 'Not specified'}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment details below:</p>
      </div>
      ${emailData.html}
    `;

    emailPayloads.push({
      ...baseEmailPayload,
      to: emailData.to.slice(1),
      subject: `${emailData.subject} (CC to: ${emailData.to[0]})`,
      html: ccHtml,
    });
  }

  try {
    // Send all emails concurrently
    const results = await Promise.all(
      emailPayloads.map(payload => sendEmailWithResend(payload))
    );

    const endTime = Date.now();
    console.log(`Batch email send completed in ${endTime - startTime}ms`);

    return {
      primary: results[0],
      cc: results[1] || null
    };
  } catch (error) {
    console.error('Error in batch email send:', error);
    throw error;
  }
}

export async function sendEmail(emailData: EmailData, logData: EmailLogEntry): Promise<Response> {
  const startTime = Date.now();
  console.log('Starting email send process:', { emailData, logData });

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create initial log entry and send emails concurrently
    const [logEntry, emailResults] = await Promise.all([
      createEmailLog(supabase, logData),
      sendEmails(emailData)
    ]);

    // Update log with results
    const updateData = {
      recipient_status: emailResults.primary.success ? 'sent' : 'failed',
      recipient_error_message: !emailResults.primary.success ? JSON.stringify(emailResults.primary.error) : null,
      cc_status: emailResults.cc ? (emailResults.cc.success ? 'sent' : 'failed') : null,
      cc_error_message: emailResults.cc?.error ? JSON.stringify(emailResults.cc.error) : null,
    };

    await updateEmailLog(supabase, logEntry.id, updateData);

    const endTime = Date.now();
    console.log(`Total email process completed in ${endTime - startTime}ms`);

    return new Response(JSON.stringify(emailResults.primary.data), {
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
    throw new Error('Failed to update email log');
  }
}