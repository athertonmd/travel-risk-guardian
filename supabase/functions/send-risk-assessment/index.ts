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

    // Send to main recipient
    const mainEmailData = {
      from: "Risk Assessment <onboarding@resend.dev>",
      to,
      subject: `Risk Assessment - ${country}`,
      html,
    };

    // Send to CC recipients with modified subject
    const ccEmailData = cc?.length ? {
      from: "Risk Assessment <onboarding@resend.dev>",
      to: cc,
      subject: `Risk Assessment - ${country} (sent to ${to[0]})`,
      html,
    } : null;

    console.log('Sending main email with data:', JSON.stringify(mainEmailData, null, 2));
    
    // Send main email
    const mainRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(mainEmailData),
    });

    if (!mainRes.ok) {
      const error = await mainRes.text();
      console.error('Resend API error (main email):', error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send CC email if there are CC recipients
    if (ccEmailData) {
      console.log('Sending CC email with data:', JSON.stringify(ccEmailData, null, 2));
      const ccRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(ccEmailData),
      });

      if (!ccRes.ok) {
        const error = await ccRes.text();
        console.error('Resend API error (CC email):', error);
        // We don't return error here as main email was sent successfully
      }
    }

    const data = await mainRes.json();
    console.log('Emails sent successfully:', data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-risk-assessment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);