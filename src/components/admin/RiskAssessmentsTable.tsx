import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EditRiskAssessmentDialog } from "./EditRiskAssessmentDialog";
import { RiskAssessmentsTableBody } from "./RiskAssessmentsTableBody";
import { RiskAssessmentSearch } from "./RiskAssessmentSearch";
import { RiskAssessmentActions } from "./RiskAssessmentActions";
import { useRiskAssessmentFilters } from "./hooks/useRiskAssessmentFilters";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    searchTerm, 
    setSearchTerm, 
    filteredAssessments 
  } = useRiskAssessmentFilters(assessments);

  const handleDelete = async (assessment: RiskAssessment) => {
    try {
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', assessment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessment deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete risk assessment",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  const confirmDelete = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setEditDialogOpen(true);
  };

  return (
    <>
      <RiskAssessmentActions />

      <RiskAssessmentSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Information</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Update Date</TableHead>
              <TableHead>Amended by</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <RiskAssessmentsTableBody
            assessments={filteredAssessments}
            isLoading={isLoading}
            onDelete={confirmDelete}
            onEdit={handleEdit}
          />
        </Table>
      </div>

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