import { RiskAssessment } from "@/components/dashboard/RiskMap";
import { EmailRiskAssessmentDialog } from "./EmailRiskAssessmentDialog";

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
  clientId?: string;
}

export const RiskAssessmentCard = ({ assessment, clientId }: RiskAssessmentCardProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="relative p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <EmailRiskAssessmentDialog
        country={assessment.country}
        assessment={assessment.assessment}
        information={assessment.information}
        clientId={clientId}
      />
      <h3 className="text-lg font-semibold mb-2">{assessment.country}</h3>
      <div className="mb-2">
        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRiskColor(assessment.assessment)}`}>
          {assessment.assessment.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-600">{assessment.information}</p>
    </div>
  );
};