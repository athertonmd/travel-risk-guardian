import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const formattedRiskLevel = risk_level.toString().toLowerCase();

    const html = `
      <h1>Risk Assessment Notification</h1>
      <p>A new risk assessment has been created for ${country}.</p>
      <h2>Risk Level: ${formattedRiskLevel.toUpperCase()}</h2>
      <h2>Details:</h2>
      <p>${information}</p>
    `;

    // Get user's email for the from field
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      throw new Error('Could not find user email');
    }

    // Prepare email data using the user's verified email
    const mainEmailData = {
      from: `Risk Assessment <${userData.email}>`,
      to,
      subject: `Risk Assessment - ${country}`,
      html,
    };

    console.log('Sending main email with data:', JSON.stringify(mainEmailData, null, 2));
    
    try {
      // Send main email
      const mainRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(mainEmailData),
      });

      const responseText = await mainRes.text();
      console.log('Resend API response:', responseText);

      if (!mainRes.ok) {
        // Log failed email attempt
        const { error: logError } = await supabase.from('email_logs').insert({
          recipient: to,
          cc: cc ? cc : null,
          country,
          risk_level: formattedRiskLevel,
          sent_by: user_id,
          status: 'failed',
          error_message: responseText,
          sent_at: new Date().toISOString()
        });

        if (logError) {
          console.error('Error logging failed email:', logError);
        }

        throw new Error(responseText);
      }

      // Log successful email
      const { error: logError } = await supabase.from('email_logs').insert({
        recipient: to,
        cc: cc ? cc : null,
        country,
        risk_level: formattedRiskLevel,
        sent_by: user_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      if (logError) {
        console.error('Error logging successful email:', logError);
        throw logError;
      }

      return new Response(JSON.stringify({ success: true }), {
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
  } catch (error) {
    console.error("Error in send-risk-assessment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});