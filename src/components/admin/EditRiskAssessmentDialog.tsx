import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="information"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter risk assessment details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Update Assessment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
