import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  cc?: string[];
  country: string;
  assessment: string;
  information: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, cc, country, assessment, information }: EmailRequest = await req.json();
    console.log(`Sending risk assessment email for ${country} to:`, to);
    if (cc?.length) console.log('CC recipients:', cc);

    const html = `
      <h2>Risk Assessment for ${country}</h2>
      <p><strong>Risk Level:</strong> ${assessment.toUpperCase()}</p>
      <p><strong>Information:</strong></p>
      <p>${information}</p>
    `;

    const emailData = {
      from: "Risk Assessment <onboarding@resend.dev>",
      to,
      ...(cc?.length && { cc }),
      subject: `Risk Assessment - ${country}`,
      html,
    };

    console.log('Sending email with data:', JSON.stringify(emailData, null, 2));

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Email sent successfully:', data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const error = await res.text();
      console.error('Resend API error:', error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in send-risk-assessment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);