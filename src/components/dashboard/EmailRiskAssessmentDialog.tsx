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

  // Check session when component mounts and when dialog opens
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('Session check error:', error);
        onOpenChange(false); // Close dialog if not authenticated
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    if (open) {
      checkSession();
    }
  }, [open, navigate, onOpenChange]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: EmailFormData) => {
    // Double check authentication before submission
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !user) {
      onOpenChange(false); // Close dialog
      toast({
        title: "Authentication Required",
        description: "Please sign in to send emails",
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
      user
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