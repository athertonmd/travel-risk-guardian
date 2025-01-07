import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PanelLeftClose } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
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
    <div className="p-6">
      <div className="mb-4">
        <SidebarTrigger />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Risk Assessments Dashboard</h1>
        
        <DashboardSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div className="mb-8">
          <RiskMap assessments={filteredAssessments} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <div 
              key={assessment.id}
              className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{assessment.country}</h3>
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  assessment.assessment === 'low' ? 'bg-green-100 text-green-800' :
                  assessment.assessment === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  assessment.assessment === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {assessment.assessment.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600">{assessment.information}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;