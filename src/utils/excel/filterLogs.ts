import { subDays, subMonths } from "date-fns";
import type { EmailLog } from "@/types/email-logs";

export type FilterPeriod = 'week' | 'month' | 'all';

export const filterLogsByPeriod = (emailLogs: EmailLog[] | undefined, period: FilterPeriod) => {
  if (!emailLogs) return [];
  
  const now = new Date();
  const cutoffDate = period === 'week' 
    ? subDays(now, 7)
    : period === 'month'
      ? subMonths(now, 1)
      : new Date(0); // beginning of time for 'all'

  return emailLogs.filter(log => {
    const logDate = new Date(log.sent_at);
    return logDate >= cutoffDate;
  });
};