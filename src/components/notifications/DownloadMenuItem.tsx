import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { FilterPeriod } from "@/utils/excel/filterLogs";

interface DownloadMenuItemProps {
  period: FilterPeriod;
  onClick: (period: FilterPeriod) => void;
  label: string;
}

export const DownloadMenuItem = ({ period, onClick, label }: DownloadMenuItemProps) => {
  return (
    <DropdownMenuItem onClick={() => onClick(period)}>
      {label}
    </DropdownMenuItem>
  );
};