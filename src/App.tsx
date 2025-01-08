import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
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
      </Router>
    </QueryClientProvider>
  );
}

export default App;