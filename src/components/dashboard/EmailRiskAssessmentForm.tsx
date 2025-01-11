import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EmailFormData {
  email: string;
  cc: string;
  requireApproval: boolean;
}

interface EmailRiskAssessmentFormProps {
  form: UseFormReturn<EmailFormData>;
  isSubmitting: boolean;
}

export const EmailRiskAssessmentForm = ({ form, isSubmitting }: EmailRiskAssessmentFormProps) => {
  const { register, setValue } = form;

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id="requireApproval"
          onCheckedChange={(checked) => {
            setValue("requireApproval", checked as boolean);
          }}
        />
        <Label htmlFor="requireApproval" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Send for approval first
        </Label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send"}
      </Button>
    </form>
  );
};