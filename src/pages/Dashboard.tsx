import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { RiskAssessmentGrid } from "@/components/dashboard/RiskAssessmentGrid";
import RiskMap from "@/components/dashboard/RiskMap";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const filteredAssessments = assessments.filter((assessment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assessment.country.toLowerCase().includes(searchLower) ||
      assessment.assessment.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
          />

          <RiskAssessmentGrid assessments={filteredAssessments} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;