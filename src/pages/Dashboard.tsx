import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeftClose } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

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

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <PanelLeftClose className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome to your Travel Risk Guardian dashboard.</p>
    </div>
  );
};

export default Dashboard;