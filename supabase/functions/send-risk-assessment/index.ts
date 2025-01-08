import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
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

    // Get user's email for logging purposes
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user profile:', userError);
      throw new Error('Could not find user email');
    }

    // During testing, we can only send to the verified email
    const testingMode = true; // Set this to false after domain verification
    const recipientEmail = testingMode ? 'athertonmd@gmail.com' : to;

    // Prepare email data using Resend's default domain
    const mainEmailData = {
      from: 'Travel Risk Guardian <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Risk Assessment - ${country}`,
      html,
    };

    if (!testingMode && cc && cc.length > 0) {
      mainEmailData.cc = cc;
    }

    console.log('Sending email with data:', JSON.stringify(mainEmailData, null, 2));
    
    try {
      // Send email using Resend
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
          cc: cc || null,
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
        cc: cc || null,
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