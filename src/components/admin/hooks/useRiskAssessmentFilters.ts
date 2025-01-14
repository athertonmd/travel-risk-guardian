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

export const useRiskAssessmentFilters = (assessments: RiskAssessment[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredAssessments = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return assessments?.filter((assessment) => {
      const matchesSearch = 
        assessment.country.toLowerCase().includes(searchLower) ||
        assessment.assessment.toLowerCase().includes(searchLower);
      
      const matchesClient = 
        !selectedClientId || assessment.client_id === selectedClientId;

      return matchesSearch && matchesClient;
    });
  }, [assessments, searchTerm, selectedClientId]);

  return {
    searchTerm,
    setSearchTerm,
    selectedClientId,
    setSelectedClientId,
    filteredAssessments,
  };
};