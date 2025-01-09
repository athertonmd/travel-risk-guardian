import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  from: string;
  to: string;
  cc?: string[];
  subject: string;
  html: string;
}

interface LogData {
  recipient: string;
  cc: string[] | null;
  country: string;
  risk_level: string;
  sent_by: string;
  status: 'success' | 'failed';
  error_message?: string;
}

export const sendEmail = async (emailData: EmailData, logData: LogData) => {
  console.log('Sending email with data:', { to: emailData.to, subject: emailData.subject });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        ...emailData,
        from: 'Travel Risk Guardian <notifications@tripguardian.netlify.app>'
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    await logEmailAttempt({ ...logData, status: 'success' });
    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    await logEmailAttempt({ 
      ...logData, 
      status: 'failed',
      error_message: error.message 
    });
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

const logEmailAttempt = async (logData: LogData) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { error } = await supabase
      .from('email_logs')
      .insert([logData]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging email attempt:', error);
  }
};