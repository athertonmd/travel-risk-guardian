import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarHeader } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

export const SidebarProfile = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [lastLogin, setLastLogin] = useState<string>("");

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserEmail(session.user.email || "");
        setLastLogin(format(new Date(session.user.last_sign_in_at || ""), "PPpp"));
      }
    };

    getUserInfo();
  }, []);

  return (
    <SidebarHeader className="border-b border-border/10 p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{userEmail}</p>
          <p className="text-xs text-muted-foreground">Last login: {lastLogin}</p>
        </div>
      </div>
    </SidebarHeader>
  );
};