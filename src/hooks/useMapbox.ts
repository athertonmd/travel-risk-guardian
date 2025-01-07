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
          setError('You must be logged in to view the map');
          setIsLoading(false);
          return;
        }

        console.log('Attempting to fetch Mapbox token with session:', session.user.id);

        const { data, error: functionError } = await supabase.functions.invoke('get-mapbox-token', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
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

    fetchMapboxToken();
  }, []);

  return { mapboxToken, isLoading, error };
};