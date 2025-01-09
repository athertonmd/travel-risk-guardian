import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsTable } from "@/components/notifications/NotificationsTable";
import { useEmailLogs } from "@/hooks/useEmailLogs";

const RiskNotificationLog = () => {
  const navigate = useNavigate();
  const { emailLogs, isLoading } = useEmailLogs();

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