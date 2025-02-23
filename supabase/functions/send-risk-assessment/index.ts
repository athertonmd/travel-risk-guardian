import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EmailService } from "./emailService.ts";
import { EmailLogger } from "./emailLogger.ts";
import { SENDER_EMAIL, REPLY_TO_EMAIL, corsHeaders } from "./config.ts";
import { generateEmailHtml } from "./emailTemplate.ts";
import { EmailData, EmailResults } from "./types.ts";
import { renderAsync } from '@react-email/components';
import RiskAssessmentEmail from './RiskAssessmentEmail.tsx';

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
      html: generateEmailHtml(
        emailData.country,
        emailData.risk_level,
        emailData.information,
        false,
        emailData.travellerName,
        emailData.recordLocator
      ),
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
      ${generateEmailHtml(
        emailData.country,
        emailData.risk_level,
        emailData.information,
        true,
        emailData.travellerName,
        emailData.recordLocator
      )}
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
    console.log('Received request data:', {
      ...requestData,
      client_id: requestData.client_id || 'not provided',
      user_id: requestData.user_id || 'not provided'
    });

    // Render primary recipient email
    const primaryHtml = await renderAsync(
      React.createElement(RiskAssessmentEmail, {
        country: requestData.country,
        risk_level: requestData.risk_level,
        information: requestData.information,
        travellerName: requestData.travellerName,
        recordLocator: requestData.recordLocator,
        isCC: false
      })
    );

    // Render CC recipient email if needed
    let ccHtml;
    if (requestData.cc?.length > 0) {
      ccHtml = await renderAsync(
        React.createElement(RiskAssessmentEmail, {
          country: requestData.country,
          risk_level: requestData.risk_level,
          information: requestData.information,
          travellerName: requestData.travellerName,
          recordLocator: requestData.recordLocator,
          isCC: true
        })
      );
    }

    console.log('Creating email log with data:', {
      recipient: requestData.to,
      cc: requestData.cc?.length > 0 ? requestData.cc : null,
      country: requestData.country,
      risk_level: requestData.risk_level,
      sent_by: requestData.user_id,
      client_id: requestData.client_id || null,
      traveller_name: requestData.travellerName || null
    });

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
        traveller_name: requestData.travellerName || null,
        client_id: requestData.client_id || null
      }),
      emailService.sendEmail({
        from: SENDER_EMAIL,
        to: [requestData.to],
        subject: `Risk Assessment - ${requestData.country}`,
        html: primaryHtml,
        reply_to: REPLY_TO_EMAIL
      })
    ]);

    // Send CC emails if needed
    let ccResults = null;
    if (requestData.cc?.length > 0 && ccHtml) {
      ccResults = await emailService.sendEmail({
        from: SENDER_EMAIL,
        to: requestData.cc,
        subject: `Risk Assessment - ${requestData.country} (CC)`,
        html: ccHtml,
        reply_to: REPLY_TO_EMAIL
      });
    }

    // Update log with results
    await emailLogger.updateLog(logEntry.id, {
      recipient_status: emailResults.success ? 'sent' : 'failed',
      recipient_error_message: emailResults.success ? null : JSON.stringify(emailResults.error),
      cc_status: ccResults ? (ccResults.success ? 'sent' : 'failed') : null,
      cc_error_message: ccResults?.error ? JSON.stringify(ccResults.error) : null,
    });

    return new Response(JSON.stringify(emailResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: emailResults.success ? 200 : 500,
    });

  } catch (error: any) {
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
