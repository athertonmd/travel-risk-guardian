import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onBackClick: () => void;
  onUploadClick: () => void;
  uploading: boolean;
}

export const AdminHeader = ({ onBackClick, onUploadClick, uploading }: AdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackClick}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      <div className="flex items-center gap-4">
        <Button 
          onClick={onUploadClick}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Excel"}
        </Button>
      </div>
    </div>
  );
};