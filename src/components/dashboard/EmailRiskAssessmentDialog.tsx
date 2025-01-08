import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailDialogProps {
  country: string;
  assessment: string;
  information: string;
}

interface EmailFormData {
  email: string;
  cc: string;
}

export const EmailRiskAssessmentDialog = ({ country, assessment, information }: EmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<EmailFormData>();

  const onSubmit = async (data: EmailFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const ccEmails = data.cc ? data.cc.split(',').map(email => email.trim()) : [];
      
      const { error } = await supabase.functions.invoke('send-risk-assessment', {
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
        description: "Risk assessment sent successfully",
      });
      setOpen(false);
    } catch (error) {
      console.error('Send email error:', error);
      toast({
        title: "Error",
        description: "Failed to send risk assessment",
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
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter recipient's email"
              {...register("email", { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="cc">CC (Optional)</Label>
            <Input
              id="cc"
              type="text"
              placeholder="Enter CC emails, separated by commas"
              {...register("cc")}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};