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
      // Clear all local storage first to ensure no stale data remains
      localStorage.clear();
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        // Show error toast but still redirect
        toast({
          title: "Sign out status",
          description: "You have been signed out. Redirecting to login page.",
          variant: "default",
        });
      }

    } catch (error: any) {
      console.error("Sign out error:", error);
      // Show error toast but still redirect
      toast({
        title: "Sign out status",
        description: "You have been signed out. Redirecting to login page.",
        variant: "default",
      });
    } finally {
      // Always redirect to auth page, regardless of any errors
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