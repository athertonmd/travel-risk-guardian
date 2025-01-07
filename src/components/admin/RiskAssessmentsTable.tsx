import { format } from "date-fns";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TableActionButtons } from "./TableActionButtons";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface RiskAssessment {
  id: string;
  country: string;
  assessment: string;
  information: string;
  created_at: string;
  updated_at: string;
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
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <>
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
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assessments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No risk assessments found
                </TableCell>
              </TableRow>
            ) : (
              assessments?.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>{assessment.country}</TableCell>
                  <TableCell className="capitalize">{assessment.assessment}</TableCell>
                  <TableCell>{assessment.information}</TableCell>
                  <TableCell>{format(new Date(assessment.created_at), "PPp")}</TableCell>
                  <TableCell>{format(new Date(assessment.updated_at), "PPp")}</TableCell>
                  <TableCell>{assessment.profiles?.email}</TableCell>
                  <TableCell className="text-right">
                    <TableActionButtons
                      onDelete={() => confirmDelete(assessment)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedAssessment && handleDelete(selectedAssessment)}
        countryName={selectedAssessment?.country}
      />
    </>
  );
};