import { TableRow } from "@/components/ui/table";
import { NotificationTableCells } from "./NotificationTableCells";
import type { EmailLog } from "@/types/email-logs";

interface NotificationTableRowProps {
  log: EmailLog;
}

export const NotificationTableRow = ({ log }: NotificationTableRowProps) => {
  // Add detailed logging to help debug the traveller name
  console.log('Email log details:', {
    id: log.id,
    recipient: log.recipient,
    recipient_status: log.recipient_status,
    recipient_error: log.recipient_error_message,
    cc_status: log.cc_status,
    cc_error: log.cc_error_message,
    sent_at: log.sent_at,
    traveller_name: log.traveller_name,
    client: log.clients?.name
  });

  return (
    <TableRow key={log.id}>
      <NotificationTableCells log={log} />
    </TableRow>
  );
};