import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsTable } from "@/components/notifications/NotificationsTable";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const RiskNotificationLog = () => {
  const navigate = useNavigate();
  const { emailLogs, isLoading } = useEmailLogs();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error("Session check error:", error);
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <AdminHeader
          onBackClick={() => navigate('/dashboard')}
          onUploadClick={() => {}}
          uploading={false}
          hideUpload
        />
      </div>

      <div className="rounded-md border">
        <NotificationsTable emailLogs={emailLogs} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RiskNotificationLog;