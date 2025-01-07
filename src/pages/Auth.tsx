import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/lovable-uploads/243e0528-d3a3-4c86-84cc-b625f3a5bbb7.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 backdrop-blur-sm bg-white/90 p-8 rounded-xl shadow-2xl">
          <div>
            <h1 className="text-center text-3xl font-bold text-gray-900">
              Travel Risk Guardian
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your trusted travel risk assessment platform
            </p>
          </div>

          <div className="mt-8">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#1a365d',
                      brandAccent: '#0ea5e9',
                    },
                  },
                },
                className: {
                  container: 'flex flex-col gap-4',
                  button: 'px-4 py-2 rounded-md font-medium',
                  input: 'px-3 py-2 rounded-md border border-gray-300',
                }
              }}
              providers={[]}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-white">
        <p className="text-sm">© 2024 Travel Risk Guardian. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Auth;