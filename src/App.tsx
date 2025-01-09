import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import RiskNotificationLog from "@/pages/RiskNotificationLog";
import "./App.css";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="relative min-h-screen bg-background">
          {!isAuthPage && (
            <div className="fixed inset-y-0 z-50">
              <AppSidebar />
            </div>
          )}
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/risk-assessments" element={<Admin />} />
              <Route path="/admin/notifications" element={<RiskNotificationLog />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
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