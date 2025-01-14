import { Input } from "@/components/ui/input";
import { ClientSelector } from "@/components/dashboard/ClientSelector";

interface RiskAssessmentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedClientId: string | null;
  onClientChange: (clientId: string, clientName: string) => void;
}

export const RiskAssessmentSearch = ({
  searchTerm,
  onSearchChange,
  selectedClientId,
  onClientChange,
}: RiskAssessmentSearchProps) => {
  return (
    <div className="flex items-start gap-4 mb-4">
      <ClientSelector
        selectedClientId={selectedClientId}
        onClientChange={onClientChange}
      />
      <div className="flex-1">
        <Input
          placeholder="Search by country or risk level (low, medium, high, extreme)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
    </div>
  );
};