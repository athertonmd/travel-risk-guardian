import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { NotificationTableRow } from "./NotificationTableRow";
import { NotificationTableHeader } from "./NotificationTableHeader";
import type { EmailLog } from "@/types/email-logs";

interface NotificationsTableProps {
  emailLogs: EmailLog[] | undefined;
  isLoading: boolean;
}

export const NotificationsTable = ({ emailLogs, isLoading }: NotificationsTableProps) => {
  return (
    <Table>
      <NotificationTableHeader />
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : !emailLogs?.length ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center">
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