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
  searchTerm: string;
}

const RiskMap = ({ assessments, searchTerm }: RiskMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { mapboxToken, isLoading, error } = useMapbox();

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      if (!map.current) {
        const mapInstance = initializeMap(mapContainer.current, mapboxToken);
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

  // Effect to handle search term changes
  useEffect(() => {
    if (!map.current || !searchTerm) return;

    const searchedAssessment = assessments.find(
      assessment => assessment.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchedAssessment) {
      // Get the country feature
      const features = map.current.querySourceFeatures('composite', {
        sourceLayer: 'country_boundaries',
        filter: ['==', ['get', 'name_en'], searchedAssessment.country]
      });

      if (features.length > 0) {
        // Calculate the bounds of the country
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0];
            coordinates.forEach((coord: any) => {
              bounds.extend(coord as mapboxgl.LngLatLike);
            });
          }
        });

        // Fly to the country with animation
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 6,
          duration: 2000
        });
      }
    }
  }, [searchTerm, assessments]);

  return (
    <MapContainer isLoading={isLoading} error={error}>
      <div ref={mapContainer} className="w-full h-full" />
    </MapContainer>
  );
};

export default RiskMap;