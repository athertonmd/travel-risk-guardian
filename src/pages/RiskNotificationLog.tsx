import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsTable } from "@/components/notifications/NotificationsTable";
import { DownloadLogsButton } from "@/components/notifications/DownloadLogsButton";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const RiskNotificationLog = () => {
  const navigate = useNavigate();
  const { emailLogs, isLoading } = useEmailLogs();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error("Session check error:", error);
          if (mounted) {
            toast({
              title: "Authentication Error",
              description: "Please sign in again to continue.",
              variant: "destructive",
            });
            navigate('/auth');
          }
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          navigate('/auth');
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          navigate('/auth');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <AdminHeader
            onBackClick={() => navigate('/dashboard')}
            onUploadClick={() => {}}
            uploading={false}
            hideUpload
          />
        </div>
        <DownloadLogsButton emailLogs={emailLogs} />
      </div>

      <div className="rounded-md border">
        <NotificationsTable emailLogs={emailLogs} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RiskNotificationLog;