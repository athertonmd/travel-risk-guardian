import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmailRiskAssessmentForm } from "./EmailRiskAssessmentForm";

interface EmailDialogProps {
  country: string;
  assessment: string;
  information: string;
}

interface EmailFormData {
  email: string;
  cc: string;
  requireApproval: boolean;
}

export const EmailRiskAssessmentDialog = ({ country, assessment, information }: EmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<EmailFormData>({
    defaultValues: {
      requireApproval: false
    }
  });

  const onSubmit = async (data: EmailFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const ccEmails = data.cc ? data.cc.split(',').map(email => email.trim()) : [];
      
      if (data.requireApproval) {
        // Placeholder for approval workflow
        toast({
          title: "Approval Required",
          description: "This feature is coming soon. The email will be sent for approval.",
        });
        setOpen(false);
        return;
      }

      const { error, data: response } = await supabase.functions.invoke('send-risk-assessment', {
        body: {
          to: data.email,
          cc: ccEmails,
          country,
          risk_level: assessment,
          information,
          user_id: user.id
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment sent successfully (Note: Currently in testing mode - emails will be sent to the verified email address only)",
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Send email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send risk assessment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2">
          <Mail className="h-4 w-4" />
          <span className="sr-only">Email Risk Assessment</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Risk Assessment</DialogTitle>
          <DialogDescription>
            Note: Currently in testing mode - all emails will be sent to the verified email address only.
          </DialogDescription>
        </DialogHeader>
        <EmailRiskAssessmentForm 
          form={form} 
          isSubmitting={form.formState.isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};
