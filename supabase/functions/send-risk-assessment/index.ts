import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EmailRequest } from "./types.ts";
import { generateEmailHtml } from "./emailTemplate.ts";
import { sendEmail } from "./emailSender.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, cc, country, risk_level, information, user_id }: EmailRequest = await req.json();

    if (!to || !country || !risk_level || !information || !user_id) {
      throw new Error('Missing required fields');
    }

    console.log('Processing email request:', { to, cc, country, risk_level, user_id });

    // Generate email HTML content
    const html = generateEmailHtml(country, risk_level, information);

    // Send primary recipient email
    const primaryEmailResponse = await sendEmail(
      {
        to: [to],
        subject: `Risk Assessment - ${country}`,
        html,
      },
      {
        recipient: to,
        cc: cc || null,
        country,
        risk_level,
        sent_by: user_id,
        recipient_status: 'pending',
        cc_status: cc && cc.length > 0 ? 'pending' : null,
        sent_at: new Date().toISOString(),
      }
    );

    // If there are CC recipients, send them separate emails
    if (cc && cc.length > 0) {
      for (const ccEmail of cc) {
        await sendEmail(
          {
            to: [ccEmail],
            subject: `Risk Assessment - ${country} (CC: sent to ${to})`,
            html,
          },
          {
            recipient: ccEmail,
            cc: null,
            country,
            risk_level,
            sent_by: user_id,
            recipient_status: 'pending',
            sent_at: new Date().toISOString(),
          }
        );
      }
    }

    return primaryEmailResponse;

  } catch (error: any) {
    console.error('Error in send-risk-assessment function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || "An error occurred while processing your request"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});