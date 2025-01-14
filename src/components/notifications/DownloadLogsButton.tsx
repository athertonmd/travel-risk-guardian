import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { format, subDays, subMonths } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface EmailLog {
  sent_at: string;
  recipient_status: string;
  cc_status: string | null;
  recipient: string;
  cc: string[] | null;
  country: string;
  risk_level: string;
  clients?: {
    name: string;
  } | null;
  profiles: {
    email: string;
  };
}

interface DownloadLogsButtonProps {
  emailLogs: EmailLog[] | undefined;
}

export const DownloadLogsButton = ({ emailLogs }: DownloadLogsButtonProps) => {
  const filterLogsByPeriod = (period: 'week' | 'month' | 'all') => {
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

  const downloadLogs = (period: 'week' | 'month' | 'all') => {
    try {
      const filteredLogs = filterLogsByPeriod(period);
      
      if (filteredLogs.length === 0) {
        toast({
          title: "No logs found",
          description: "There are no logs available for the selected period.",
          variant: "destructive",
        });
        return;
      }

      // Transform logs for Excel format
      const excelData = filteredLogs.map(log => ({
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Risk Notification Logs");

      // Generate filename with date range
      const dateStr = format(new Date(), "yyyy-MM-dd");
      const filename = `risk-notification-logs-${period}-${dateStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Download successful",
        description: `Logs have been downloaded for the selected period.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the logs. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Logs
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => downloadLogs('week')}>
          Past Week
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadLogs('month')}>
          Past Month
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadLogs('all')}>
          All Time
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};