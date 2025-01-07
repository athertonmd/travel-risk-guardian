import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapbox } from "@/hooks/useMapbox";
import { MapContainer } from "@/components/map/MapContainer";
import { 
  initializeMap, 
  setupMapLayers, 
  updateCountryColors, 
  setupMapInteractions 
} from '@/utils/map';

export interface RiskAssessment {
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
      if (!map.current) {
        const mapInstance = initializeMap(mapContainer.current, mapboxToken);
        
        mapInstance.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        map.current = mapInstance;

        mapInstance.on('style.load', () => {
          console.log('Style loaded, setting up layers...');
          setupMapLayers(mapInstance);
          
          mapInstance.once('sourcedata', (e) => {
            if (e.isSourceLoaded) {
              console.log('Source loaded, updating colors...');
              updateCountryColors(mapInstance, assessments);
              setupMapInteractions(mapInstance, assessments);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, assessments]);

  return (
    <MapContainer isLoading={isLoading} error={error}>
      <div ref={mapContainer} className="w-full h-full" />
    </MapContainer>
  );
};

export default RiskMap;