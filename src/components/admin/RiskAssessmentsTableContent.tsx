import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskAssessmentsTableBody } from "./RiskAssessmentsTableBody";

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

interface RiskAssessmentsTableContentProps {
  assessments: RiskAssessment[] | undefined;
  isLoading: boolean;
  onDelete: (assessment: RiskAssessment) => void;
  onEdit: (assessment: RiskAssessment) => void;
}

export const RiskAssessmentsTableContent = ({
  assessments,
  isLoading,
  onDelete,
  onEdit,
}: RiskAssessmentsTableContentProps) => {
  return (
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
          assessments={assessments}
          isLoading={isLoading}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </Table>
    </div>
  );
};