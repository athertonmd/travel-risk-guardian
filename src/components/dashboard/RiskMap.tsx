import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface RiskAssessment {
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
}

interface RiskMapProps {
  assessments: RiskAssessment[];
}

const RiskMap = ({ assessments }: RiskMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token from Supabase
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data, error } = await supabase.functions.invoke('get-mapbox-token');
          if (!error && data?.token) {
            setMapboxToken(data.token);
            setIsLoading(false);
          } else {
            console.error('Error fetching Mapbox token:', error);
            setError('Failed to load map configuration');
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Initialize map only if not already initialized
      if (!map.current) {
        mapboxgl.accessToken = mapboxToken;
        
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          projection: 'globe',
          zoom: 1.5,
          center: [30, 15],
          pitch: 45,
        });

        // Add navigation controls
        mapInstance.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        map.current = mapInstance;
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default RiskMap;