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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error("Session error:", error);
          navigate('/auth');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth error:", error);
        navigate('/auth');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="p-6">
        <DashboardHeader />
        
        <div className="mx-auto max-w-7xl space-y-8">
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