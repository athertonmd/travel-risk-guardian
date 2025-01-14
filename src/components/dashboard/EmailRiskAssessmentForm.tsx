import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EmailFormData {
  email: string;
  cc: string;
  requireApproval: boolean;
  travellerName: string;
  recordLocator: string;
}

interface EmailRiskAssessmentFormProps {
  form: UseFormReturn<EmailFormData>;
  isSubmitting: boolean;
  onSubmit: (data: EmailFormData) => Promise<void>;
}

export const EmailRiskAssessmentForm = ({ form, isSubmitting, onSubmit }: EmailRiskAssessmentFormProps) => {
  const { register, setValue } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="travellerName">Traveller Name</Label>
        <Input
          id="travellerName"
          type="text"
          placeholder="Enter traveller's name"
          {...register("travellerName", { required: true })}
        />
      </div>
      <div>
        <Label htmlFor="recordLocator">Record Locator</Label>
        <Input
          id="recordLocator"
          type="text"
          placeholder="Enter record locator"
          {...register("recordLocator")}
        />
      </div>
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
          Send for approval
        </Label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send"}
      </Button>
    </form>
  );
};