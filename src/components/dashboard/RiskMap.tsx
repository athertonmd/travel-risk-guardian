import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapbox } from "@/hooks/useMapbox";
import { MapContainer } from "@/components/map/MapContainer";

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
  const { mapboxToken, isLoading, error } = useMapbox();

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
          zoom: 3.5, // Increased zoom level for better view of Europe
          center: [15, 50], // Centered on Europe (approximately central Europe)
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
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  return (
    <MapContainer isLoading={isLoading} error={error}>
      <div ref={mapContainer} className="w-full h-full" />
    </MapContainer>
  );
};

export default RiskMap;