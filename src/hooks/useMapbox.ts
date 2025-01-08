import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useMapbox = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No session found');
          setError('You must be logged in to view the map');
          setIsLoading(false);
          return;
        }

        console.log('Session found, attempting to fetch Mapbox token');

        // Ensure we have a valid access token
        if (!session.access_token) {
          console.error('No access token in session');
          setError('Authentication error');
          setIsLoading(false);
          return;
        }

        const { data, error: functionError } = await supabase.functions.invoke('get-mapbox-token', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (functionError) {
          console.error('Function error:', functionError);
          setError('Failed to load map configuration');
          setIsLoading(false);
          return;
        }

        if (data?.token) {
          console.log('Successfully retrieved Mapbox token');
          setMapboxToken(data.token);
          setIsLoading(false);
        } else {
          console.error('No token in response:', data);
          setError('No map configuration found');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchMapboxToken();
      } else {
        setMapboxToken('');
        setError('You must be logged in to view the map');
        setIsLoading(false);
      }
    });

    // Initial fetch
    fetchMapboxToken();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { mapboxToken, isLoading, error };
};