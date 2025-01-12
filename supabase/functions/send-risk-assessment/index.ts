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
    const { to, cc, country, risk_level, information, user_id, travellerName }: EmailRequest = await req.json();

    if (!to || !country || !risk_level || !information || !user_id) {
      throw new Error('Missing required fields');
    }

    console.log('Processing email request:', { to, cc, country, risk_level, user_id, travellerName });

    // Generate email HTML content
    const html = generateEmailHtml(country, risk_level, information);

    // Create a single email log entry for both primary recipient and CC
    const emailResponse = await sendEmail(
      {
        to: [to, ...(cc || [])],
        subject: `Risk Assessment - ${country}`,
        html,
        travellerName: travellerName || ''
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
        traveller_name: travellerName || null // Ensure traveller name is saved
      }
    );

    return emailResponse;

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