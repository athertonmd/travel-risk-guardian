import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface BulkUploadDialogProps {
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  assessments: Array<{
    country: string;
    assessment: string;
    information: string;
  }>;
}

export const BulkUploadDialog = ({ 
  showDialog, 
  onOpenChange,
  assessments 
}: BulkUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('bulk-upload-assessments', {
        body: { 
          assessments,
          userId: session.user.id
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${data.count} risk assessments uploaded successfully`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload assessments",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Risk Assessments</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to upload {assessments.length} risk assessments. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={uploading}>Cancel</AlertDialogCancel>
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};