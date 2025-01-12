import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { NotificationStatus } from "./NotificationStatus";
import { RiskLevelBadge } from "./RiskLevelBadge";

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
  traveller_name?: string | null;
  profiles: {
    email: string;
  };
}

interface NotificationTableRowProps {
  log: EmailLog;
}

export const NotificationTableRow = ({ log }: NotificationTableRowProps) => {
  // Add detailed logging
  console.log('Email log details:', {
    id: log.id,
    recipient: log.recipient,
    recipient_status: log.recipient_status,
    recipient_error: log.recipient_error_message,
    cc_status: log.cc_status,
    cc_error: log.cc_error_message,
    sent_at: log.sent_at,
    traveller_name: log.traveller_name
  });

  return (
    <TableRow key={log.id}>
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
      <TableCell>{log.profiles.email}</TableCell>
    </TableRow>
  );
};