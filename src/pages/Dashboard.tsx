import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { RiskAssessmentGrid } from "@/components/dashboard/RiskAssessmentGrid";
import RiskMap from "@/components/dashboard/RiskMap";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  // Fetch risk assessments data
  const { data: assessments = [] } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*');
      
      if (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch risk assessments",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!session,
  });

  const handleCountryClick = (country: string) => {
    setSearchTerm(country);
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assessment.country.toLowerCase().includes(searchLower) ||
      assessment.assessment.toLowerCase().includes(searchLower)
    );
  });

  if (!session) {
    return null;
  }

  return (
    <div className="flex-1 w-full">
      <div className="p-6">
        <DashboardHeader />
        
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <RiskMap 
            assessments={filteredAssessments} 
            searchTerm={searchTerm}
            onCountryClick={handleCountryClick}
          />

          <RiskAssessmentGrid assessments={filteredAssessments} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;