import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : assessments?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};