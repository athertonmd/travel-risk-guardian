import {
  BarChart3,
  FileText,
  Globe,
  Mail,
  Settings,
  Users,
} from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/dashboard",
  },
  {
    title: "Risk Management",
    icon: Globe,
    subItems: [
      {
        title: "Risk Assessments",
        url: "/admin/risk-assessments",
      },
      {
        title: "Risk Notifications",
        url: "/admin/notifications",
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];