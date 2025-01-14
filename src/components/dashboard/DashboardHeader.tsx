import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  selectedClientName?: string | null;
}

export const DashboardHeader = ({ selectedClientName }: DashboardHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-3xl font-bold text-gray-900">
          Risk Assessments Dashboard
          {selectedClientName && ` for ${selectedClientName}`}
        </h1>
      </div>
    </div>
  );
};