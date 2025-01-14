import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormValues {
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  clientId: string;
}

export const useRiskAssessmentForm = (onSuccess: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    defaultValues: {
      country: "",
      assessment: "low",
      information: "",
      clientId: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add risk assessments",
          variant: "destructive",
        });
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        toast({
          title: "Error",
          description: "Could not find your profile",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("risk_assessments")
        .insert({
          country: values.country,
          assessment: values.assessment,
          information: values.information,
          amended_by: profileData.id,
          client_id: values.clientId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["risk-assessments"] });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Add risk assessment error:", error);
      toast({
        title: "Error",
        description: "Failed to add risk assessment",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};