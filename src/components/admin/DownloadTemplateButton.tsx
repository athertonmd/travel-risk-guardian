import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DownloadTemplateButton = () => {
  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template.xlsx';
    link.download = 'risk-assessment-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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