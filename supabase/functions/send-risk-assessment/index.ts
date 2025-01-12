import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EmailService } from "./emailService.ts";
import { EmailLogger } from "./emailLogger.ts";
import { SENDER_EMAIL, REPLY_TO_EMAIL, corsHeaders } from "./config.ts";
import { generateEmailHtml } from "./emailTemplate.ts";
import { EmailData, EmailResults } from "./types.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const emailService = new EmailService(RESEND_API_KEY);
const emailLogger = new EmailLogger(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendEmails(emailData: EmailData, primaryRecipient: string, ccRecipients: string[]): Promise<EmailResults> {
  const emailPromises = [];

  // Prepare primary email
  emailPromises.push(
    emailService.sendEmail({
      from: SENDER_EMAIL,
      to: [primaryRecipient],
      subject: emailData.subject,
      html: emailData.html,
      reply_to: REPLY_TO_EMAIL
    })
  );

  // Prepare CC emails if any
  if (ccRecipients.length > 0) {
    const ccSubject = `Risk Assessment - ${emailData.country} (Traveller: ${emailData.travellerName || 'Not specified'})`;
    const ccHtml = `
      <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0; color: #666;">This email was sent as a CC. The primary recipient is: <strong>${primaryRecipient}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment for traveller: <strong>${emailData.travellerName || 'Not specified'}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment details below:</p>
      </div>
      ${emailData.html}
    `;

    emailPromises.push(
      emailService.sendEmail({
        from: SENDER_EMAIL,
        to: ccRecipients,
        subject: ccSubject,
        html: ccHtml,
        reply_to: REPLY_TO_EMAIL
      })
    );
  }

  // Send all emails concurrently
  const results = await Promise.all(emailPromises);

  return {
    primary: results[0],
    cc: results[1] || null
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const emailData: EmailData = {
      to: [requestData.to, ...(requestData.cc || [])],
      subject: `Risk Assessment - ${requestData.country}`,
      html: generateEmailHtml(requestData.country, requestData.risk_level, requestData.information),
      country: requestData.country,
      travellerName: requestData.travellerName
    };

    // Create log entry and send emails concurrently
    const [logEntry, emailResults] = await Promise.all([
      emailLogger.createLog({
        recipient: requestData.to,
        cc: requestData.cc?.length > 0 ? requestData.cc : null,
        country: requestData.country,
        risk_level: requestData.risk_level,
        sent_by: requestData.user_id,
        recipient_status: 'pending',
        cc_status: requestData.cc?.length > 0 ? 'pending' : null,
        sent_at: new Date().toISOString(),
        traveller_name: requestData.travellerName || null
      }),
      sendEmails(
        emailData,
        requestData.to,
        requestData.cc || []
      )
    ]);

    // Update log with results
    await emailLogger.updateLog(logEntry.id, {
      recipient_status: emailResults.primary.success ? 'sent' : 'failed',
      recipient_error_message: emailResults.primary.success ? null : JSON.stringify(emailResults.primary.error),
      cc_status: emailResults.cc ? (emailResults.cc.success ? 'sent' : 'failed') : null,
      cc_error_message: emailResults.cc?.error ? JSON.stringify(emailResults.cc.error) : null,
    });

    return new Response(JSON.stringify(emailResults.primary.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: emailResults.primary.success ? 200 : 500,
    });

  } catch (error) {
    console.error('Error in send-risk-assessment function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: 'Failed to send email. Check the Edge Function logs for more details.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});