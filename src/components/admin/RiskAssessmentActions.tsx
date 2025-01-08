import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRiskAssessmentDialog } from "./AddRiskAssessmentDialog";
import { FileUploadDialog } from "./FileUploadDialog";
import { BulkUploadDialog } from "./BulkUploadDialog";

const sampleAssessments = [
  // ... your provided assessments data formatted as an array of objects
  {
    country: "Brazil",
    assessment: "high",
    information: "TRA is required if travelling to any deprived areas of major urban cities"
  },
  // ... rest of the assessments
];

export const RiskAssessmentActions = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <AddRiskAssessmentDialog />
        <Button
          variant="outline"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Excel
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowBulkUploadDialog(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </div>

      <FileUploadDialog
        showDialog={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />

      <BulkUploadDialog
        showDialog={showBulkUploadDialog}
        onOpenChange={setShowBulkUploadDialog}
        assessments={sampleAssessments}
      />
    </div>
  );
};
