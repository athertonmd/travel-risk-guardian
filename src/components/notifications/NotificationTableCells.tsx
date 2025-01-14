import { format } from "date-fns";
import { TableCell } from "@/components/ui/table";
import { NotificationStatus } from "./NotificationStatus";
import { RiskLevelBadge } from "./RiskLevelBadge";
import type { EmailLog } from "@/types/email-logs";

interface NotificationTableCellsProps {
  log: EmailLog;
}

export const NotificationTableCells = ({ log }: NotificationTableCellsProps) => {
  return (
    <>
      <TableCell>
        {log.sent_at ? format(new Date(log.sent_at), "MMM d, yyyy HH:mm") : "-"}
      </TableCell>
      <TableCell>
        <NotificationStatus 
          status={log.recipient_status} 
          errorMessage={log.recipient_error_message} 
        />
      </TableCell>
      <TableCell>
        {log.cc && log.cc.length > 0 ? (
          <NotificationStatus 
            status={log.cc_status || 'pending'} 
            errorMessage={log.cc_error_message} 
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>{log.recipient}</TableCell>
      <TableCell>{log.cc?.join(", ") || "-"}</TableCell>
      <TableCell className="font-medium">
        {log.traveller_name || "-"}
      </TableCell>
      <TableCell>{log.country}</TableCell>
      <TableCell>
        <RiskLevelBadge level={log.risk_level} />
      </TableCell>
      <TableCell>{log.clients?.name || "-"}</TableCell>
      <TableCell>{log.profiles.email}</TableCell>
    </>
  );
};