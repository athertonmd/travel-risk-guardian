import React from 'react';
import { Info } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { RiskAssessment } from '@/components/dashboard/RiskMap';

interface CountryPopupProps {
  assessment: RiskAssessment;
  triggerElement: React.ReactNode;
}

export const CountryPopup = ({ assessment, triggerElement }: CountryPopupProps) => {
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
    <HoverCard>
      <HoverCardTrigger asChild>
        {triggerElement}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{assessment.country}</h4>
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <p className={`text-sm font-medium ${getRiskColor(assessment.assessment)}`}>
                {assessment.assessment.toUpperCase()} RISK
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {assessment.information}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};