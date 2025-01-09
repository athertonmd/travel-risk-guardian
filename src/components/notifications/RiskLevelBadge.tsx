import { Badge } from "@/components/ui/badge";

interface RiskLevelBadgeProps {
  level: string;
}

export const RiskLevelBadge = ({ level }: RiskLevelBadgeProps) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    low: "default",
    medium: "secondary",
    high: "destructive",
    extreme: "destructive",
  };

  return <Badge variant={variants[level]}>{level.toUpperCase()}</Badge>;
};