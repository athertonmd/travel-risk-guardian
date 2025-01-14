import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { NotificationTableRow } from "./NotificationTableRow";
import { NotificationTableHeader } from "./NotificationTableHeader";
import { ClientSelector } from "../dashboard/ClientSelector";
import { useState } from "react";
import type { EmailLog } from "@/types/email-logs";

interface NotificationsTableProps {
  emailLogs: EmailLog[] | undefined;
  isLoading: boolean;
}

export const NotificationsTable = ({ emailLogs, isLoading }: NotificationsTableProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredLogs = selectedClientId 
    ? emailLogs?.filter(log => log.client_id === selectedClientId)
    : emailLogs;

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId === selectedClientId ? null : clientId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ClientSelector 
          selectedClientId={selectedClientId} 
          onClientChange={handleClientChange}
          showClearOption
        />
      </div>
      <Table>
        <NotificationTableHeader />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : !filteredLogs?.length ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                No email logs found
              </TableCell>
            </TableRow>
          ) : (
            filteredLogs.map((log) => (
              <NotificationTableRow key={log.id} log={log} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};