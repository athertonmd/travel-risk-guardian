import { format } from "date-fns";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableActionButtons } from "./TableActionButtons";

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

interface RiskAssessmentsTableBodyProps {
  assessments: RiskAssessment[] | undefined;
  isLoading: boolean;
  onDelete: (assessment: RiskAssessment) => void;
}

export const RiskAssessmentsTableBody = ({
  assessments,
  isLoading,
  onDelete,
}: RiskAssessmentsTableBodyProps) => {
  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center">
            Loading...
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (!assessments?.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center">
            No risk assessments found
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {assessments.map((assessment) => (
        <TableRow key={assessment.id}>
          <TableCell>{assessment.country}</TableCell>
          <TableCell className="capitalize">{assessment.assessment}</TableCell>
          <TableCell>{assessment.information}</TableCell>
          <TableCell>{format(new Date(assessment.created_at), "PPp")}</TableCell>
          <TableCell>{format(new Date(assessment.updated_at), "PPp")}</TableCell>
          <TableCell>{assessment.profiles?.email}</TableCell>
          <TableCell className="text-right">
            <TableActionButtons
              onDelete={() => onDelete(assessment)}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};