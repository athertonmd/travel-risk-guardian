import { Card, CardContent } from "@/components/ui/card";
import { EmailRiskAssessmentDialog } from "./EmailRiskAssessmentDialog";
import { CountryPopup } from "../map/CountryPopup";

interface RiskAssessmentCardProps {
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  clientName?: string;
}

export const RiskAssessmentCard = ({ country, assessment, information, clientName }: RiskAssessmentCardProps) => {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <CountryPopup
          assessment={{ id: country, country, assessment, information }}
          triggerElement={<h3 className="text-lg font-semibold mb-2">{country}</h3>}
        />
        <p className="text-sm text-muted-foreground mb-2">{information}</p>
        <EmailRiskAssessmentDialog
          country={country}
          assessment={assessment}
          information={information}
          clientName={clientName}
        />
      </CardContent>
    </Card>
  );
};