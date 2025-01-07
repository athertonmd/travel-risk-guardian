import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthContent from "@/components/auth/AuthContent";
import AuthFooter from "@/components/auth/AuthFooter";

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
      <AuthBackground />
      <AuthContent errorMessage={errorMessage} />
      <AuthFooter />
    </div>
  );
};

export default Auth;