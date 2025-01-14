import { useState } from "react";
import { RiskAssessment } from "@/components/dashboard/RiskMap";
import { EmailRiskAssessmentDialog } from "./EmailRiskAssessmentDialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
  clientId?: string;
}

export const RiskAssessmentCard = ({ assessment, clientId }: RiskAssessmentCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        country={assessment.country}
        assessment={assessment.assessment}
        information={assessment.information}
        clientId={clientId}
      />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{assessment.country}</h3>
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRiskColor(assessment.assessment)}`}>
              {assessment.assessment.toUpperCase()}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      </div>
      <p className="text-gray-600">{assessment.information}</p>
    </div>
  );
};