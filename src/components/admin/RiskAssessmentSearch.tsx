import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RiskAssessmentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  assessmentFilter: string;
  onAssessmentFilterChange: (value: string) => void;
}

export const RiskAssessmentSearch = ({
  searchTerm,
  onSearchChange,
  assessmentFilter,
  onAssessmentFilterChange,
}: RiskAssessmentSearchProps) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Search by country..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Select value={assessmentFilter} onValueChange={onAssessmentFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by assessment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assessments</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="extreme">Extreme</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};