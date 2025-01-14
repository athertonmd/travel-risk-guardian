import * as XLSX from 'xlsx';
import { format } from "date-fns";
import type { FilterPeriod } from "./filterLogs";

export const downloadExcel = (data: any[], period: FilterPeriod) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, "Risk Notification Logs");

  const dateStr = format(new Date(), "yyyy-MM-dd");
  const filename = `risk-notification-logs-${period}-${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
};