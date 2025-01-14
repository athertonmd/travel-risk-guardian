import { RiskAssessmentActions } from "./RiskAssessmentActions";
import { RiskAssessmentSearch } from "./RiskAssessmentSearch";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EditRiskAssessmentDialog } from "./EditRiskAssessmentDialog";
import { RiskAssessmentsTableContent } from "./RiskAssessmentsTableContent";
import { useRiskAssessmentFilters } from "./hooks/useRiskAssessmentFilters";
import { useRiskAssessmentActions } from "./hooks/useRiskAssessmentActions";
import { useClientSelection } from "@/hooks/useClientSelection";

interface RiskAssessment {
  id: string;
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  profiles?: {
    email: string;
  };
}

interface RiskAssessmentsTableProps {
  assessments: RiskAssessment[] | undefined;
  isLoading: boolean;
}

export const RiskAssessmentsTable = ({ assessments, isLoading }: RiskAssessmentsTableProps) => {
  const { 
    selectedClientId,
    selectedClientName,
    handleClientChange,
  } = useClientSelection();

  const { 
    searchTerm, 
    setSearchTerm, 
    filteredAssessments 
  } = useRiskAssessmentFilters(assessments, selectedClientId);

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedAssessment,
    handleDelete,
    confirmDelete,
    handleEdit,
  } = useRiskAssessmentActions();

  return (
    <>
      <RiskAssessmentActions />

      <RiskAssessmentSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClientId={selectedClientId}
        onClientChange={handleClientChange}
      />

      {selectedClientId ? (
        <RiskAssessmentsTableContent
          assessments={filteredAssessments}
          isLoading={isLoading}
          onDelete={confirmDelete}
          onEdit={handleEdit}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[400px] border rounded-md">
          <p className="text-gray-500">Please select a client to view risk assessments.</p>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedAssessment && handleDelete(selectedAssessment)}
        countryName={selectedAssessment?.country}
      />

      <EditRiskAssessmentDialog
        assessment={selectedAssessment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};