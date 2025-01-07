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
  const [assessmentFilter, setAssessmentFilter] = useState("");

  const filteredAssessments = useMemo(() => {
    return assessments?.filter((assessment) => {
      const matchesSearch = assessment.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAssessment = !assessmentFilter || assessment.assessment === assessmentFilter;
      return matchesSearch && matchesAssessment;
    });
  }, [assessments, searchTerm, assessmentFilter]);

  return {
    searchTerm,
    setSearchTerm,
    assessmentFilter,
    setAssessmentFilter,
    filteredAssessments,
  };
};