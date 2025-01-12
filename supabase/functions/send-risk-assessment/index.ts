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

async function sendPrimaryEmail(emailData: EmailData, primaryRecipient: string): Promise<EmailResults['primary']> {
  console.log('Sending primary email to:', primaryRecipient);
  
  return await emailService.sendEmail({
    from: SENDER_EMAIL,
    to: [primaryRecipient],
    subject: emailData.subject,
    html: emailData.html,
    reply_to: REPLY_TO_EMAIL
  });
}

async function sendCCEmails(
  emailData: EmailData, 
  primaryRecipient: string, 
  ccRecipients: string[]
): Promise<EmailResults['cc']> {
  if (!ccRecipients.length) return null;
  
  console.log('Sending CC emails to:', ccRecipients);
  
  const ccSubject = `Risk Assessment - ${emailData.country} (Traveller: ${emailData.travellerName || 'Not specified'})`;
  const ccHtml = generateCCEmailContent(emailData, primaryRecipient);

  return await emailService.sendEmail({
    from: SENDER_EMAIL,
    to: ccRecipients,
    subject: ccSubject,
    html: ccHtml,
    reply_to: REPLY_TO_EMAIL
  });
}

function generateCCEmailContent(emailData: EmailData, primaryRecipient: string): string {
  return `
    <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
      <p style="margin: 0; color: #666;">This email was sent as a CC. The primary recipient is: <strong>${primaryRecipient}</strong></p>
      <p style="margin: 5px 0 0; color: #666;">Risk assessment for traveller: <strong>${emailData.travellerName || 'Not specified'}</strong></p>
      <p style="margin: 5px 0 0; color: #666;">Risk assessment details below:</p>
    </div>
    ${emailData.html}
  `;
}

async function createEmailData(requestData: any): Promise<EmailData> {
  const {
    to,
    cc = [],
    country,
    risk_level,
    information,
    travellerName
  } = requestData;

  return {
    to: [to, ...(cc || [])],
    subject: `Risk Assessment - ${country}`,
    html: generateEmailHtml(country, risk_level, information),
    country,
    travellerName
  };
}

async function handleEmailSending(emailData: EmailData): Promise<EmailResults> {
  const primaryRecipient = emailData.to[0];
  const ccRecipients = emailData.to.slice(1);

  const results: EmailResults = {
    primary: await sendPrimaryEmail(emailData, primaryRecipient)
  };

  if (ccRecipients.length > 0) {
    results.cc = await sendCCEmails(emailData, primaryRecipient, ccRecipients);
  }

  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const emailData = await createEmailData(requestData);
    
    // Create initial log entry
    const logEntry = await emailLogger.createLog({
      recipient: requestData.to,
      cc: requestData.cc?.length > 0 ? requestData.cc : null,
      country: requestData.country,
      risk_level: requestData.risk_level,
      sent_by: requestData.user_id,
      recipient_status: 'pending',
      cc_status: requestData.cc?.length > 0 ? 'pending' : null,
      sent_at: new Date().toISOString(),
      traveller_name: requestData.travellerName || null
    });

    // Send emails and get results
    const emailResults = await handleEmailSending(emailData);
    console.log('Email sending results:', emailResults);

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