import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onBackClick: () => void;
  onUploadClick: () => void;
  uploading: boolean;
  hideUpload?: boolean;
}

export const AdminHeader = ({ onBackClick, onUploadClick, uploading, hideUpload }: AdminHeaderProps) => {
  return (
    <div className="flex-1 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackClick}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      {!hideUpload && (
        <div className="flex items-center gap-4">
          <Button 
            onClick={onUploadClick}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Excel"}
          </Button>
        </div>
      )}
    </div>
  );
};