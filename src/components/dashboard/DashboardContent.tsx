import { ClientSelector } from "./ClientSelector";
import { DashboardSearch } from "./DashboardSearch";
import RiskMap from "./RiskMap";
import { RiskAssessmentGrid } from "./RiskAssessmentGrid";

interface DashboardContentProps {
  selectedClientId: string | null;
  handleClientChange: (clientId: string, clientName: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredAssessments: any[];
  handleCountryClick: (country: string) => void;
}

export const DashboardContent = ({
  selectedClientId,
  handleClientChange,
  searchTerm,
  setSearchTerm,
  filteredAssessments,
  handleCountryClick,
}: DashboardContentProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <ClientSelector
          selectedClientId={selectedClientId}
          onClientChange={handleClientChange}
          showAllOption={false}
        />
        <div className="flex-1 w-full">
          <DashboardSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>

      {selectedClientId ? (
        <>
          <RiskMap 
            assessments={filteredAssessments} 
            searchTerm={searchTerm}
            onCountryClick={handleCountryClick}
          />
          <RiskAssessmentGrid assessments={filteredAssessments} />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-500">Please select a client to view risk assessments.</p>
        </div>
      )}
    </div>
  );
};