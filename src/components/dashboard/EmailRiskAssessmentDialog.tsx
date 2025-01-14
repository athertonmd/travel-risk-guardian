import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailRiskAssessmentForm } from "./EmailRiskAssessmentForm";
import { useUser } from "@supabase/auth-helpers-react";
import { handleEmailSubmission } from "@/utils/emailSubmission";

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
  const form = useForm<EmailFormData>({
    defaultValues: {
      email: "",
      cc: "",
      requireApproval: false,
      travellerName: "",
      recordLocator: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: EmailFormData) => {
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