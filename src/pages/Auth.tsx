import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
      if (event === "USER_UPDATED") {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage(""); // Clear errors on sign out
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case "invalid_credentials":
          return "Invalid email or password. Please check your credentials and try again.";
        case "email_not_confirmed":
          return "Please verify your email address before signing in.";
        case "user_not_found":
          return "No user found with these credentials.";
        case "invalid_grant":
          return "Invalid login credentials.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  return (
    <div className="min-h-screen flex flex-col">
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
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="backdrop-blur-sm bg-white/90 p-8 rounded-xl shadow-2xl">
            <div>
              <h1 className="text-center text-3xl font-bold text-gray-900">
                Travel Risk Guardian
              </h1>
              <p className="mt-2 text-center text-sm text-gray-600">
                Your trusted travel risk assessment platform
              </p>
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

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
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-white">
        <p className="text-sm">© 2024 Travel Risk Guardian. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Auth;