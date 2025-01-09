import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationStatus } from "./NotificationStatus";
import { RiskLevelBadge } from "./RiskLevelBadge";

interface EmailLog {
  id: string;
  sent_at: string;
  status: string;
  recipient: string;
  cc?: string[];
  country: string;
  risk_level: string;
  error_message?: string | null;
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
          <TableHead>Status</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>CC</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Sent By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : !emailLogs?.length ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No email logs found
            </TableCell>
          </TableRow>
        ) : (
          emailLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {log.sent_at ? format(new Date(log.sent_at), "MMM d, yyyy HH:mm") : "-"}
              </TableCell>
              <TableCell>
                <NotificationStatus status={log.status} errorMessage={log.error_message} />
              </TableCell>
              <TableCell>{log.recipient}</TableCell>
              <TableCell>{log.cc?.join(", ") || "-"}</TableCell>
              <TableCell>{log.country}</TableCell>
              <TableCell>
                <RiskLevelBadge level={log.risk_level} />
              </TableCell>
              <TableCell>{log.profiles.email}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};