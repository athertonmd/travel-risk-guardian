import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SidebarSignOut = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we have a session, try to sign out
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        // If no session exists, just clear local storage and redirect
        console.log("No active session found, clearing local storage");
      }

      // Clear any stored session data
      localStorage.clear();
      
      // Redirect to auth page
      navigate('/auth');
      
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out notification",
        description: "You have been signed out. Redirecting to login page.",
        variant: "default",
      });
      
      // Still redirect to auth page even if there's an error
      navigate('/auth');
    }
  };

  return (
    <SidebarFooter>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign Out"
                onClick={handleSignOut}
                variant="outline"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarFooter>
  );
};