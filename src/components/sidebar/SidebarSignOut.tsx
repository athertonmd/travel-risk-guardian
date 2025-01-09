import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

export const SidebarSignOut = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        // If we get a session_not_found error, we can still redirect to auth
        // since it means the user is effectively signed out
        if (error.message.includes("session_not_found")) {
          navigate('/auth');
          return;
        }
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: "Please try again or refresh the page",
        });
        return;
      }
      navigate('/auth');
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again or refresh the page",
      });
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