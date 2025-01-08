import { Sidebar } from "@/components/ui/sidebar";
import { SidebarProfile } from "./sidebar/SidebarProfile";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarSignOut } from "./sidebar/SidebarSignOut";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarProfile />
      <SidebarNavigation />
      <SidebarSignOut />
    </Sidebar>
  );
}