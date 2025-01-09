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
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
}

export const sendEmail = async (emailData: EmailData, logData: LogData) => {
  console.log('Starting email send process:', { 
    to: emailData.to, 
    subject: emailData.subject,
    resendKeyExists: !!RESEND_API_KEY 
  });

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    console.log('Attempting to send email via Resend API');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        ...emailData,
        from: 'Travel Risk Guardian <onboarding@resend.dev>'
      }),
    });

    const responseText = await res.text();
    console.log('Resend API response:', responseText);

    if (!res.ok) {
      let errorMessage = 'Failed to send email';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    console.log('Email sent successfully');
    await logEmailAttempt({ ...logData, status: 'success' });
    
    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    await logEmailAttempt({ 
      ...logData, 
      status: 'failed',
      error_message: errorMessage
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "If you're testing, make sure your domain is verified in Resend and you're using a valid email address."
    }), {
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
    console.log('Logging email attempt:', logData);
    const { error } = await supabase
      .from('email_logs')
      .insert([logData]);

    if (error) {
      console.error('Error logging email attempt:', error);
      throw error;
    }
    console.log('Email attempt logged successfully');
  } catch (error) {
    console.error('Error logging email attempt:', error);
  }
};