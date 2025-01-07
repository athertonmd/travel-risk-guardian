import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface TableActionButtonsProps {
  onDelete: () => void;
}

export const TableActionButtons = ({ onDelete }: TableActionButtonsProps) => {
  const { toast } = useToast();

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toast({
            title: "Coming Soon",
            description: "Edit functionality will be available soon",
          });
        }}
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        <span className="sr-only">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/90" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
};