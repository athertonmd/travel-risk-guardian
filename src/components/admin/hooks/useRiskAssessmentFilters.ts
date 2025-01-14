import { useState, useMemo } from "react";

interface RiskAssessment {
  id: string;
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  profiles?: {
    email: string;
  };
}

export const useRiskAssessmentFilters = (
  assessments: RiskAssessment[] | undefined,
  selectedClientId: string | null
) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssessments = useMemo(() => {
    if (!selectedClientId) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return assessments?.filter((assessment) => {
      const matchesSearch = 
        assessment.country.toLowerCase().includes(searchLower) ||
        assessment.assessment.toLowerCase().includes(searchLower);
      
      const matchesClient = assessment.client_id === selectedClientId;

      return matchesSearch && matchesClient;
    });
  }, [assessments, searchTerm, selectedClientId]);

  return {
    searchTerm,
    setSearchTerm,
    filteredAssessments,
  };
};