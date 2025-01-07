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

        const { data, error: functionError } = await supabase.functions.invoke('get-mapbox-token', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (functionError) {
          console.error('Error fetching Mapbox token:', functionError);
          setError('Failed to load map configuration');
          setIsLoading(false);
          return;
        }

        if (data?.token) {
          setMapboxToken(data.token);
          setIsLoading(false);
        } else {
          setError('No map configuration found');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  return { mapboxToken, isLoading, error };
};