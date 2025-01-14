import { RiskAssessmentCard } from "./RiskAssessmentCard";

interface RiskAssessment {
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  client_name?: string;
}

interface RiskAssessmentGridProps {
  assessments: RiskAssessment[];
}

export const RiskAssessmentGrid = ({ assessments }: RiskAssessmentGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assessments.map((assessment, index) => (
        <RiskAssessmentCard
          key={`${assessment.country}-${index}`}
          country={assessment.country}
          assessment={assessment.assessment}
          information={assessment.information}
          clientName={assessment.client_name}
        />
      ))}
    </div>
  );
};