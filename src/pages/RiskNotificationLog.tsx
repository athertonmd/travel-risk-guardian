import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

type EmailLog = Database['public']['Tables']['email_logs']['Row'] & {
  profiles: {
    email: string;
  };
};

const RiskNotificationLog = () => {
  const navigate = useNavigate();

  const { data: emailLogs, isLoading } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as EmailLog[];
    },
  });

  const getRiskLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "default",
      medium: "secondary",
      high: "destructive",
      extreme: "destructive",
    };
    return <Badge variant={variants[level]}>{level.toUpperCase()}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <AdminHeader
          onBackClick={() => navigate('/dashboard')}
          onUploadClick={() => {}}
          uploading={false}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>CC</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Date Sent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : emailLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No email logs found
                </TableCell>
              </TableRow>
            ) : (
              emailLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.recipient}</TableCell>
                  <TableCell>{log.cc?.join(", ") || "-"}</TableCell>
                  <TableCell>{log.country}</TableCell>
                  <TableCell>{getRiskLevelBadge(log.risk_level)}</TableCell>
                  <TableCell>{log.profiles.email}</TableCell>
                  <TableCell>
                    {format(new Date(log.sent_at!), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === "sent" ? "default" : "destructive"}
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RiskNotificationLog;