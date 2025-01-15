import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmailRiskAssessmentForm } from "./EmailRiskAssessmentForm";
import { useUser } from "@supabase/auth-helpers-react";
import { handleEmailSubmission } from "@/utils/emailSubmission";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface EmailFormData {
  email: string;
  cc: string;
  requireApproval: boolean;
  travellerName: string;
  recordLocator: string;
}

interface EmailRiskAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  assessment: string;
  information: string;
  clientId?: string;
}

export const EmailRiskAssessmentDialog = ({
  open,
  onOpenChange,
  country,
  assessment,
  information,
  clientId,
}: EmailRiskAssessmentDialogProps) => {
  const user = useUser();
  const navigate = useNavigate();
  const form = useForm<EmailFormData>({
    defaultValues: {
      email: "",
      cc: "",
      requireApproval: false,
      travellerName: "",
      recordLocator: "",
    },
  });

  // Check session when dialog opens
  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking session in EmailRiskAssessmentDialog...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Session check result:', {
        hasSession: !!session,
        sessionError: error,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });

      if (!session || error) {
        console.error('Session check failed:', { error, session });
        onOpenChange(false);
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue",
          variant: "destructive",
        });
        navigate('/auth');
        return false;
      }

      // Wait a moment for the user object to be populated
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return true;
    };

    if (open) {
      checkSession();
    }
  }, [open, navigate, onOpenChange, user]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: EmailFormData) => {
    console.log('Starting email submission...', {
      currentUser: user,
      formData: data,
      clientId
    });

    // Get the current session and user
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    console.log('Session and user check before submission:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      currentUser
    });
    
    if (!session || !currentUser) {
      console.error('No active session or user found during submission');
      onOpenChange(false);
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const success = await handleEmailSubmission(
      data,
      country,
      assessment,
      information,
      clientId,
      currentUser
    );

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Risk Assessment Email</DialogTitle>
          <DialogDescription>
            Send a risk assessment report for {country} to the specified email address.
          </DialogDescription>
        </DialogHeader>
        <EmailRiskAssessmentForm
          form={form}
          isSubmitting={form.formState.isSubmitting}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};