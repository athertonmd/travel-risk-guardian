import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import RiskNotificationLog from "@/pages/RiskNotificationLog";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component to handle conditional sidebar rendering and auth state
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          if (!isAuthPage) {
            toast({
              title: "Session Error",
              description: "Please sign in again.",
              variant: "destructive",
            });
            navigate('/auth');
          }
        } else if (!session && !isAuthPage) {
          navigate('/auth');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!isAuthPage) {
          navigate('/auth');
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        queryClient.clear();
        if (!isAuthPage) {
          navigate('/auth');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isAuthPage]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        {!isAuthPage && <AppSidebar />}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/risk-assessments" element={<Admin />} />
          <Route path="/admin/notifications" element={<RiskNotificationLog />} />
        </Routes>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;