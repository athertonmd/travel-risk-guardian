import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useEmailLogs = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: emailLogs, isLoading } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('email_logs')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('sent_by', session.user.id)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching email logs:', error);
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
          navigate('/auth');
        }
        throw error;
      }
      return data;
    },
    retry: false
  });

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_logs'
        },
        () => {
          console.log('New email log detected, invalidating query...');
          queryClient.invalidateQueries({ queryKey: ['email-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { emailLogs, isLoading };
};