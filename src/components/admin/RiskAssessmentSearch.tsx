import { Input } from "@/components/ui/input";

interface RiskAssessmentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const RiskAssessmentSearch = ({
  searchTerm,
  onSearchChange,
}: RiskAssessmentSearchProps) => {
  return (
    <div className="flex gap-4 mb-4">
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