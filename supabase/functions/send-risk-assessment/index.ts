// Import from Deno's standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { to, cc, country, risk_level, information, user_id } = await req.json();

    // Validate required fields
    if (!to || !country || !risk_level || !information || !user_id) {
      throw new Error('Missing required fields');
    }

    // Ensure risk_level is a string and format it
    const formattedRiskLevel = (risk_level || '').toString().toUpperCase();

    const html = `
      <h1>Risk Assessment Notification</h1>
      <p>A new risk assessment has been created for ${country}.</p>
      <h2>Risk Level: ${formattedRiskLevel}</h2>
      <h2>Details:</h2>
      <p>${information}</p>
    `;

    // Send to main recipient
    const mainEmailData = {
      from: "Risk Assessment <onboarding@resend.dev>",
      to,
      subject: `Risk Assessment - ${country}`,
      html,
    };

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
      
      // Log failed email attempt
      await supabase.from('email_logs').insert({
        recipient: to,
        cc,
        country,
        risk_level: formattedRiskLevel,
        sent_by: user_id,
        status: 'failed',
        error_message: error
      });

      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log successful main email
    await supabase.from('email_logs').insert({
      recipient: to,
      cc,
      country,
      risk_level: formattedRiskLevel,
      sent_by: user_id,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    // Send CC email if there are CC recipients
    if (cc?.length) {
      const ccEmailData = {
        from: "Risk Assessment <onboarding@resend.dev>",
        to: cc,
        subject: `Risk Assessment - ${country} (sent to ${to})`,
        html,
      };

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
        // Log failed CC email attempt
        await supabase.from('email_logs').insert({
          recipient: cc.join(', '),
          cc: null,
          country,
          risk_level: formattedRiskLevel,
          sent_by: user_id,
          status: 'failed',
          error_message: error
        });
      } else {
        // Log successful CC email
        await supabase.from('email_logs').insert({
          recipient: cc.join(', '),
          cc: null,
          country,
          risk_level: formattedRiskLevel,
          sent_by: user_id,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
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
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});