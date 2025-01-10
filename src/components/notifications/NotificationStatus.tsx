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
  // Check for any variation of "sent" status
  const isSent = status?.toLowerCase().includes('sent');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {isSent ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isSent ? 'Email sent successfully' : (errorMessage || 'Failed to send email')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};