import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { EmailData, EmailLogEntry } from "./types.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function createEmailLog(supabase: any, logData: EmailLogEntry) {
  console.log('Creating email log:', logData);
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
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Travel Risk Guardian <notifications@yourdomain.com>', // Replace with your verified domain
        to,
        subject,
        html,
        reply_to: 'notifications@yourdomain.com' // Replace with your verified domain
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Resend API error response:', errorData);
      throw new Error(errorData.message || 'Failed to send email');
    }

    const data = await res.json();
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function sendEmails(emailData: EmailData, primaryRecipient: string) {
  const promises = [];
  
  // Add primary email to promises array
  promises.push(sendEmailWithResend(
    [primaryRecipient],
    emailData.subject,
    emailData.html
  ));

  // If there are CC recipients, add them to promises array
  if (emailData.to.length > 1) {
    const ccRecipients = emailData.to.slice(1);
    console.log('Sending CC email to:', ccRecipients);
    console.log('Traveller name:', emailData.travellerName);
    
    const ccHtml = `
      <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0; color: #666;">This email was sent as a CC. The primary recipient is: <strong>${primaryRecipient}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment for traveller: <strong>${emailData.travellerName || 'Not specified'}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment details below:</p>
      </div>
      ${emailData.html}
    `;

    promises.push(sendEmailWithResend(
      ccRecipients,
      `${emailData.subject} (CC to: ${primaryRecipient})`,
      ccHtml
    ));
  }

  try {
    const results = await Promise.all(promises);
    return {
      primary: results[0],
      cc: results[1] || null
    };
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}

export async function sendEmail(emailData: EmailData, logData: EmailLogEntry): Promise<Response> {
  try {
    console.log('Starting email send process:', { emailData, logData });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create initial log entry
    const logEntry = await createEmailLog(supabase, logData);
    console.log('Created log entry:', logEntry);

    // Send emails concurrently
    const emailResults = await sendEmails(emailData, emailData.to[0]);

    // Update log with results
    await updateEmailLog(supabase, logEntry.id, {
      recipient_status: emailResults.primary.success ? 'sent' : 'failed',
      recipient_error_message: !emailResults.primary.success ? JSON.stringify(emailResults.primary.error) : null,
      cc_status: emailResults.cc ? (emailResults.cc.success ? 'sent' : 'failed') : null,
      cc_error_message: emailResults.cc?.error ? JSON.stringify(emailResults.cc.error) : null,
    });

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
  console.log('Updating email log:', { logId, status });
  const { error } = await supabase
    .from('email_logs')
    .update(status)
    .eq('id', logId);

  if (error) {
    console.error('Error updating email log:', error);
    throw new Error('Failed to update email log');
  }
}