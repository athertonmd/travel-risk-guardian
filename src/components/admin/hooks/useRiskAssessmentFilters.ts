import { useState, useMemo } from "react";

interface RiskAssessment {
  id: string;
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
  };
}

export const useRiskAssessmentFilters = (assessments: RiskAssessment[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssessments = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return assessments?.filter((assessment) => {
      return (
        assessment.country.toLowerCase().includes(searchLower) ||
        assessment.assessment.toLowerCase().includes(searchLower)
      );
    });
  }, [assessments, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredAssessments,
  };
};