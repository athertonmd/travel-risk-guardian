import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { RiskAssessmentGrid } from "@/components/dashboard/RiskAssessmentGrid";
import { ClientSelector } from "@/components/dashboard/ClientSelector";
import RiskMap from "@/components/dashboard/RiskMap";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  const { data: assessments = [], isLoading, error } = useQuery({
    queryKey: ['risk-assessments', selectedClientId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('risk_assessments')
          .select('*')
          .order('country');
        
        if (selectedClientId) {
          query = query.eq('client_id', selectedClientId);
        }
        
        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          console.error('Supabase query error:', supabaseError);
          throw supabaseError;
        }

        return data || [];
      } catch (err) {
        console.error('Error fetching risk assessments:', err);
        toast({
          title: "Error",
          description: "Failed to load risk assessments. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
  });

  const handleCountryClick = (country: string) => {
    setSearchTerm(country);
  };

  const handleClientChange = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
  };

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

  if (isLoading) {
    return (
      <div className="flex-1 w-full">
        <div className="p-6">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-gray-500">Loading risk assessments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full">
        <div className="p-6">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-red-500">Failed to load risk assessments. Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div className="p-6">
        <DashboardHeader selectedClientName={selectedClientName} />
        
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ClientSelector
              selectedClientId={selectedClientId}
              onClientChange={handleClientChange}
            />
            <div className="flex-1 w-full">
              <DashboardSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>

          {selectedClientId && (
            <>
              <RiskMap 
                assessments={filteredAssessments} 
                searchTerm={searchTerm}
                onCountryClick={handleCountryClick}
              />

              <RiskAssessmentGrid assessments={filteredAssessments} />
            </>
          )}

          {!selectedClientId && (
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-gray-500">Please select a client to view risk assessments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;