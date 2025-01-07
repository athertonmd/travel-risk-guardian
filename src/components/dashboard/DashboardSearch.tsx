import { Input } from "@/components/ui/input";

interface DashboardSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DashboardSearch = ({
  searchTerm,
  onSearchChange,
}: DashboardSearchProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <Input
        placeholder="Search risk assessments by country or risk level (low, medium, high, extreme)..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};