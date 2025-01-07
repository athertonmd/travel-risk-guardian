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
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

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

              // Setup search functionality after source is loaded
              const handleSearch = () => {
                const currentSearchTerm = searchTermRef.current;
                if (!currentSearchTerm || !mapInstance) return;

                const searchedAssessment = assessments.find(
                  assessment => assessment.country.toLowerCase().includes(currentSearchTerm.toLowerCase())
                );

                if (searchedAssessment) {
                  const features = mapInstance.querySourceFeatures('countries', {
                    sourceLayer: 'country_boundaries',
                    filter: ['==', ['get', 'name_en'], searchedAssessment.country]
                  });

                  if (features.length > 0) {
                    const bounds = new mapboxgl.LngLatBounds();
                    features.forEach(feature => {
                      if (feature.geometry.type === 'Polygon') {
                        const coordinates = feature.geometry.coordinates[0];
                        coordinates.forEach((coord: any) => {
                          bounds.extend(coord as mapboxgl.LngLatLike);
                        });
                      }
                    });

                    mapInstance.fitBounds(bounds, {
                      padding: 50,
                      maxZoom: 6,
                      duration: 2000
                    });
                  }
                }
              };

              // Initial search if there's a search term
              handleSearch();

              // Setup search term watcher
              mapInstance.on('sourcedata', () => {
                handleSearch();
              });
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