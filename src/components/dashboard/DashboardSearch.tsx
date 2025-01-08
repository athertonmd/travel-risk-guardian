import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DashboardSearch = ({
  searchTerm,
  onSearchChange,
}: DashboardSearchProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative">
      <Input
        placeholder="Search risk assessments by country or risk level (low, medium, high, extreme)..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pr-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => onSearchChange("")}
          type="button"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};