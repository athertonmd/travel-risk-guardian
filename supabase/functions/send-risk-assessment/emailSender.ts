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

    // Send primary recipient email first
    const primaryRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Travel Risk Guardian <onboarding@resend.dev>',
        to: [emailData.to[0]], // Primary recipient
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    const primaryResponseData = await primaryRes.json();
    console.log('Resend API primary response:', primaryResponseData);

    let ccResponseData = null;
    let ccSuccess = false;

    // If there are CC recipients, send them in a separate email
    if (emailData.to.length > 1) {
      const ccRecipients = emailData.to.slice(1);
      const primaryRecipient = emailData.to[0];
      
      // Modify the HTML to include the primary recipient information
      const ccHtml = `
        <div style="margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0; color: #666;">Primary recipient: ${primaryRecipient}</p>
        </div>
        ${emailData.html}
      `;

      const ccRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Travel Risk Guardian <onboarding@resend.dev>',
          to: ccRecipients,
          subject: `${emailData.subject} (CC - sent to ${primaryRecipient})`,
          html: ccHtml,
        }),
      });

      ccResponseData = await ccRes.json();
      console.log('Resend API CC response:', ccResponseData);
      ccSuccess = ccRes.ok;
    }

    // Update log based on both primary and CC status
    await supabase
      .from('email_logs')
      .update({
        recipient_status: primaryRes.ok ? 'sent' : 'failed',
        recipient_error_message: !primaryRes.ok ? primaryResponseData.message : null,
        cc_status: emailData.to.length > 1 ? (ccSuccess ? 'sent' : 'failed') : null,
        cc_error_message: ccResponseData?.message || null,
      })
      .eq('id', logEntry.id);

    if (!primaryRes.ok) {
      throw new Error(primaryResponseData.message || 'Failed to send email to primary recipient');
    }

    return new Response(JSON.stringify(primaryResponseData), {
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