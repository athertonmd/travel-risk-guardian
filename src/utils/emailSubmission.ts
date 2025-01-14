import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface EmailSubmissionData {
  email: string;
  cc?: string;
  travellerName?: string;
  recordLocator?: string;
  requireApproval?: boolean;
}

interface EmailPayload {
  to: string;
  cc?: string[];
  country: string;
  risk_level: string;
  information: string;
  user_id: string;
  travellerName?: string;
  recordLocator?: string;
  client_id?: string;
}

export const handleEmailSubmission = async (
  data: EmailSubmissionData,
  country: string,
  assessment: string,
  information: string,
  clientId: string | undefined,
  user: { id: string } | null
): Promise<boolean> => {
  if (!user) {
    toast({
      title: "Authentication Error",
      description: "You must be logged in to send emails",
      variant: "destructive",
    });
    return false;
  }

  console.log('Client ID being sent in payload:', clientId);
  const ccEmails = data.cc ? data.cc.split(',').map(email => email.trim()) : [];

  if (data.requireApproval) {
    toast({
      title: "Approval Required",
      description: "This feature is not yet implemented",
    });
    return false;
  }

  const payload: EmailPayload = {
    to: data.email,
    cc: ccEmails,
    country,
    risk_level: assessment,
    information,
    user_id: user.id,
    travellerName: data.travellerName,
    recordLocator: data.recordLocator,
    client_id: clientId
  };

  console.log('Email submission data:', payload);

  try {
    const { error, data: response } = await supabase.functions.invoke('send-risk-assessment', {
      body: payload,
    });

    if (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Email sent successfully",
    });
    return true;
  } catch (error) {
    console.error('Error in email submission:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};