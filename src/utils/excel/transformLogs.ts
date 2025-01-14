import { format } from "date-fns";
import type { EmailLog } from "@/types/email-logs";

export const transformLogsForExcel = (logs: EmailLog[]) => {
  return logs.map(log => ({
    'Date Sent': format(new Date(log.sent_at), "MMM d, yyyy HH:mm"),
    'Recipient Status': log.recipient_status,
    'CC Status': log.cc_status || '-',
    'Recipient': log.recipient,
    'CC': log.cc?.join(", ") || '-',
    'Country': log.country,
    'Risk Level': log.risk_level,
    'Client': log.clients?.name || '-',
    'Sent By': log.profiles.email
  }));
};