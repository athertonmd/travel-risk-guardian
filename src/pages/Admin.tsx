import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FileUploadDialog } from "@/components/admin/FileUploadDialog";
import { RiskAssessmentsTable } from "@/components/admin/RiskAssessmentsTable";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Admin = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <AdminHeader
          onBackClick={() => navigate('/dashboard')}
          onUploadClick={() => setShowUploadDialog(true)}
          uploading={uploading}
        />
      </div>

      <FileUploadDialog
        showDialog={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />

      <RiskAssessmentsTable
        assessments={assessments}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Admin;