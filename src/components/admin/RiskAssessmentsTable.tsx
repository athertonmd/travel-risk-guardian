import { RiskAssessmentActions } from "./RiskAssessmentActions";
import { RiskAssessmentSearch } from "./RiskAssessmentSearch";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EditRiskAssessmentDialog } from "./EditRiskAssessmentDialog";
import { RiskAssessmentsTableContent } from "./RiskAssessmentsTableContent";
import { useRiskAssessmentFilters } from "./hooks/useRiskAssessmentFilters";
import { useRiskAssessmentActions } from "./hooks/useRiskAssessmentActions";

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
    searchTerm, 
    setSearchTerm, 
    selectedClientId,
    setSelectedClientId,
    filteredAssessments 
  } = useRiskAssessmentFilters(assessments);

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

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  return (
    <>
      <RiskAssessmentActions />

      <RiskAssessmentSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClientId={selectedClientId}
        onClientChange={handleClientChange}
      />

      <RiskAssessmentsTableContent
        assessments={filteredAssessments}
        isLoading={isLoading}
        onDelete={confirmDelete}
        onEdit={handleEdit}
      />

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