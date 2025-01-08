import { Home, Settings } from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Admin",
    icon: Settings,
    subItems: [
      {
        title: "Manage Risk Assessment",
        url: "/admin",
      },
      {
        title: "Risk Notification Log",
        url: "/admin/notifications",
      },
    ],
  },
];