import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EmailService } from "./emailService.ts";
import { EmailLogger } from "./emailLogger.ts";
import { SENDER_EMAIL, REPLY_TO_EMAIL, corsHeaders } from "./config.ts";
import { EmailData, EmailResults } from "./types.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const emailService = new EmailService(RESEND_API_KEY);
const emailLogger = new EmailLogger(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendEmails(emailData: EmailData, primaryRecipient: string): Promise<EmailResults> {
  const results: EmailResults = {
    primary: await emailService.sendEmail({
      from: SENDER_EMAIL,
      to: [primaryRecipient],
      subject: emailData.subject,
      html: emailData.html,
      reply_to: REPLY_TO_EMAIL
    })
  };

  // If there are CC recipients, send to them as well
  if (emailData.to.length > 1) {
    const ccRecipients = emailData.to.slice(1);
    const ccSubject = `Risk Assessment - ${emailData.country} (Traveller: ${emailData.travellerName || 'Not specified'})`;
    const ccHtml = `
      <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 0; color: #666;">This email was sent as a CC. The primary recipient is: <strong>${primaryRecipient}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment for traveller: <strong>${emailData.travellerName || 'Not specified'}</strong></p>
        <p style="margin: 5px 0 0; color: #666;">Risk assessment details below:</p>
      </div>
      ${emailData.html}
    `;

    results.cc = await emailService.sendEmail({
      from: SENDER_EMAIL,
      to: ccRecipients,
      subject: ccSubject,
      html: ccHtml,
      reply_to: REPLY_TO_EMAIL
    });
  }

  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      cc = [],
      country,
      risk_level,
      information,
      user_id,
      travellerName
    } = await req.json();

    // Create email data
    const emailData: EmailData = {
      to: [to, ...(cc || [])],
      subject: `Risk Assessment - ${country}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Risk Assessment Report</h2>
          ${travellerName ? `<p style="color: #666;">Traveller: ${travellerName}</p>` : ''}
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Country: ${country}</h3>
            <p style="background-color: ${
              risk_level === 'extreme' ? '#ef4444' :
              risk_level === 'high' ? '#f97316' :
              risk_level === 'medium' ? '#eab308' :
              '#22c55e'
            }; color: white; padding: 10px; border-radius: 5px; display: inline-block;">
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
      `,
      country,
      travellerName
    };

    // Create initial log entry
    const logEntry = await emailLogger.createLog({
      recipient: to,
      cc: cc.length > 0 ? cc : null,
      country,
      risk_level,
      sent_by: user_id,
      recipient_status: 'pending',
      cc_status: cc.length > 0 ? 'pending' : null,
      sent_at: new Date().toISOString(),
      traveller_name: travellerName || null
    });

    // Send emails and get results
    const emailResults = await sendEmails(emailData, to);
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