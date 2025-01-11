import React from 'react';
import { Info } from 'lucide-react';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

interface CountryPopupProps {
  assessment: RiskAssessment;
  triggerElement: React.ReactNode;
}

export const CountryPopup = ({ assessment }: CountryPopupProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'extreme':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] max-w-[300px] max-h-[200px] overflow-y-auto">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">{assessment.country}</h4>
        <div className="flex items-center">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          <p className={`text-sm font-medium ${getRiskColor(assessment.assessment)}`}>
            {assessment.assessment.toUpperCase()} RISK
          </p>
        </div>
        <p className="text-sm text-muted-foreground break-words">
          {assessment.information}
        </p>
      </div>
    </div>
  );
};