import { AddRiskAssessmentDialog } from "./AddRiskAssessmentDialog";

export const RiskAssessmentActions = () => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex gap-2">
        <AddRiskAssessmentDialog />
      </div>
    </div>
  );
};