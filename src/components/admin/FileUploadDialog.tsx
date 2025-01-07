import { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadDialogProps {
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FileUploadDialog = ({ showDialog, onOpenChange }: FileUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', session.user.id);

      const { data, error } = await supabase.functions.invoke('process-excel', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Risk assessments uploaded successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
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
          <AlertDialogTitle>Upload Excel File</AlertDialogTitle>
          <AlertDialogDescription>
            Select an Excel file or drag and drop it here to upload your risk assessments.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your Excel file must contain the following columns:
            <ul className="list-disc list-inside mt-2">
              <li>Country</li>
              <li>Assessment</li>
              <li>Information</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="my-4 p-8 border-2 border-dashed rounded-lg text-center">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mx-auto"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};