import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { RiskAssessmentGrid } from "@/components/dashboard/RiskAssessmentGrid";
import RiskMap from "@/components/dashboard/RiskMap";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (!session) {
          navigate('/auth');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session check error:", error);
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // Only fetch data if authenticated
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
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
    enabled: isAuthenticated, // Only run query when authenticated
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
    return null; // Don't render anything while checking auth
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