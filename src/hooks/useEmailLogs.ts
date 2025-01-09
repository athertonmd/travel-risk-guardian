import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEmailLogs = () => {
  const queryClient = useQueryClient();

  const { data: emailLogs, isLoading } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_logs')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('sent_by', user.user.id)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching email logs:', error);
        throw error;
      }
      return data;
    },
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