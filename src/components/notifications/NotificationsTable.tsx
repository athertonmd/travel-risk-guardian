import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationTableRow } from "./NotificationTableRow";

interface EmailLog {
  id: string;
  sent_at: string;
  recipient_status: string;
  recipient_error_message?: string | null;
  cc_status?: string | null;
  cc_error_message?: string | null;
  recipient: string;
  cc?: string[];
  country: string;
  risk_level: string;
  traveller_name: string | null;
  profiles: {
    email: string;
  };
}

interface NotificationsTableProps {
  emailLogs: EmailLog[] | undefined;
  isLoading: boolean;
}

export const NotificationsTable = ({ emailLogs, isLoading }: NotificationsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date Sent</TableHead>
          <TableHead>Recipient Status</TableHead>
          <TableHead>CC Status</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>CC</TableHead>
          <TableHead>Traveller</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Sent By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : !emailLogs?.length ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center">
              No email logs found
            </TableCell>
          </TableRow>
        ) : (
          emailLogs.map((log) => (
            <NotificationTableRow key={log.id} log={log} />
          ))
        )}
      </TableBody>
    </Table>
  );
};