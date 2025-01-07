import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface AuthContentProps {
  errorMessage: string;
}

const AuthContent = ({ errorMessage }: AuthContentProps) => {
  return (
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
  );
};

export default AuthContent;