import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRiskAssessmentForm } from "@/hooks/useRiskAssessmentForm";
import { RiskAssessmentForm } from "./RiskAssessmentForm";

export const AddRiskAssessmentDialog = () => {
  const [open, setOpen] = useState(false);
  const { form, onSubmit } = useRiskAssessmentForm(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Risk Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Risk Assessment</DialogTitle>
        </DialogHeader>
        <RiskAssessmentForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};