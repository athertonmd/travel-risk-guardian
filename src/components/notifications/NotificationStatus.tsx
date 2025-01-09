import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationStatusProps {
  status: string;
  errorMessage?: string | null;
}

export const NotificationStatus = ({ status, errorMessage }: NotificationStatusProps) => {
  if (status === 'sent') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Email sent successfully</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{errorMessage || 'Failed to send email'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};