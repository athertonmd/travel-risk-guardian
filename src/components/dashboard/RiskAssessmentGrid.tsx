import { RiskAssessment } from "@/components/dashboard/RiskMap";
import { RiskAssessmentCard } from "./RiskAssessmentCard";

interface RiskAssessmentGridProps {
  assessments: RiskAssessment[];
}

export const RiskAssessmentGrid = ({ assessments }: RiskAssessmentGridProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => (
        <RiskAssessmentCard key={assessment.id} assessment={assessment} />
      ))}
    </div>
  );
};