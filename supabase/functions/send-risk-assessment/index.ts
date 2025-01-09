import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateEmailTemplate } from "./emailTemplate.ts";
import { sendEmail } from "./emailSender.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  to: string;
  cc?: string[];
  country: string;
  risk_level: string;
  information: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, cc, country, risk_level, information, user_id } = await req.json() as RequestBody;

    // Validate required fields
    if (!to || !country || !risk_level || !information || !user_id) {
      throw new Error('Missing required fields');
    }

    console.log('Processing request for:', { country, risk_level, to });

    const html = generateEmailTemplate({ country, risk_level, information });

    const emailData = {
      from: 'Travel Risk Guardian <notifications@tripguardian.netlify.app>',
      to,
      cc,
      subject: `Risk Assessment - ${country}`,
      html,
    };

    const logData = {
      recipient: to,
      cc: cc || null,
      country,
      risk_level,
      sent_by: user_id,
      status: 'pending' as const,
    };

    return await sendEmail(emailData, logData);

  } catch (error) {
    console.error('Error in send-risk-assessment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});