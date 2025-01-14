import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { DownloadMenuItem } from "./DownloadMenuItem";
import { filterLogsByPeriod, type FilterPeriod } from "@/utils/excel/filterLogs";
import { transformLogsForExcel } from "@/utils/excel/transformLogs";
import { downloadExcel } from "@/utils/excel/downloadExcel";
import type { EmailLog } from "@/types/email-logs";

interface DownloadLogsButtonProps {
  emailLogs: EmailLog[] | undefined;
}

export const DownloadLogsButton = ({ emailLogs }: DownloadLogsButtonProps) => {
  const handleDownload = (period: FilterPeriod) => {
    try {
      const filteredLogs = filterLogsByPeriod(emailLogs, period);
      
      if (filteredLogs.length === 0) {
        toast({
          title: "No logs found",
          description: "There are no logs available for the selected period.",
          variant: "destructive",
        });
        return;
      }

      const excelData = transformLogsForExcel(filteredLogs);
      downloadExcel(excelData, period);

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
        <DownloadMenuItem 
          period="week" 
          onClick={handleDownload} 
          label="Past Week" 
        />
        <DownloadMenuItem 
          period="month" 
          onClick={handleDownload} 
          label="Past Month" 
        />
        <DownloadMenuItem 
          period="all" 
          onClick={handleDownload} 
          label="All Time" 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};