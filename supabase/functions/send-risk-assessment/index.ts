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
    return new Response(null, { headers: corsHeaders });
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
      from: 'Travel Risk Guardian <onboarding@resend.dev>',
      to: 'athertonmd@gmail.com', // Temporarily set to your verified email for testing
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

  } catch (error: any) {
    console.error('Error in send-risk-assessment function:', error);
    
    // Check if the error is from Resend's API
    let errorMessage = error.message;
    try {
      if (typeof error.message === 'string' && error.message.includes('{')) {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message || error.message;
      }
    } catch {
      // If parsing fails, use the original error message
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Currently in testing mode - emails will be sent to the verified email address only."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});