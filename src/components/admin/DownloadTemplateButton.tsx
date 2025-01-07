import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

export const DownloadTemplateButton = () => {
  const downloadTemplate = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Sample data with headers
    const wsData = [
      ['Country', 'Assessment', 'Information'],
      ['Sample Country', 'HIGH', 'Sample information about the risk assessment']
    ];
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Risk Assessments");
    
    // Generate Excel file
    XLSX.writeFile(wb, "risk-assessment-template.xlsx");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadTemplate}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
};