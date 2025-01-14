import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditRiskAssessmentForm } from "./EditRiskAssessmentForm";

interface RiskAssessment {
  id: string;
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  client_id: string | null;
}

interface EditRiskAssessmentDialogProps {
  assessment: RiskAssessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditRiskAssessmentDialog = ({
  assessment,
  open,
  onOpenChange,
}: EditRiskAssessmentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<RiskAssessment>({
    defaultValues: {
      id: "",
      country: "",
      assessment: "low",
      information: "",
      client_id: null,
    },
  });

  useEffect(() => {
    if (assessment && open) {
      form.reset({
        id: assessment.id,
        country: assessment.country,
        assessment: assessment.assessment,
        information: assessment.information,
        client_id: assessment.client_id,
      });
    }
  }, [assessment, open, form]);

  const onSubmit = async (values: RiskAssessment) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to edit risk assessments",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("risk_assessments")
        .update({
          country: values.country,
          assessment: values.assessment,
          information: values.information,
          client_id: values.client_id,
        })
        .eq("id", values.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["risk-assessments"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Edit risk assessment error:", error);
      toast({
        title: "Error",
        description: "Failed to update risk assessment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Risk Assessment</DialogTitle>
        </DialogHeader>
        <EditRiskAssessmentForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};