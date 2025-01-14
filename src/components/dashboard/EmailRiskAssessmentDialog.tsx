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
  clientId?: string;
  clientName?: string;
}

interface EmailFormData {
  email: string;
  cc: string;
  requireApproval: boolean;
  travellerName: string;
  recordLocator: string;
}

export const EmailRiskAssessmentDialog = ({ country, assessment, information, clientId, clientName }: EmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<EmailFormData>({
    defaultValues: {
      requireApproval: false,
      travellerName: "",
      recordLocator: "",
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
        toast({
          title: "Approval Required",
          description: "This feature is coming soon. The email will be sent for approval.",
        });
        setOpen(false);
        return;
      }

      console.log('Sending email with data:', {
        to: data.email,
        cc: ccEmails,
        country,
        risk_level: assessment,
        information,
        user_id: user.id,
        travellerName: data.travellerName,
        recordLocator: data.recordLocator,
        client_id: clientId
      });

      const { error, data: response } = await supabase.functions.invoke('send-risk-assessment', {
        body: {
          to: data.email,
          cc: ccEmails,
          country,
          risk_level: assessment,
          information,
          user_id: user.id,
          travellerName: data.travellerName,
          recordLocator: data.recordLocator,
          client_id: clientId
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment sent successfully",
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
          <DialogTitle>
            Email Risk Assessment{clientName ? ` for ${clientName}` : ''}
          </DialogTitle>
          <DialogDescription>
            Send this risk assessment report via email.
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