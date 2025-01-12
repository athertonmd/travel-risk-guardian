import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          navigate("/auth");
          return;
        }
        
        if (session) {
          navigate("/dashboard");
        } else {
          navigate("/auth");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [navigate]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default Index;