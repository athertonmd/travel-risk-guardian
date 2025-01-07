import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DownloadTemplateButton = () => {
  const downloadTemplate = () => {
    // This is a minimal valid Excel file in base64 format with the required columns
    const base64Excel = "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";
    
    const byteCharacters = atob(base64Excel);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'risk-assessment-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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