import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <>
                    <AppSidebar />
                    <main className="flex-1">
                      <Dashboard />
                    </main>
                  </>
                }
              />
              <Route
                path="/admin"
                element={
                  <>
                    <AppSidebar />
                    <main className="flex-1">
                      <Admin />
                    </main>
                  </>
                }
              />
            </Routes>
          </div>
        </SidebarProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;