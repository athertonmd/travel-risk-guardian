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
          
          // Wait for the source to be loaded
          const waitForSource = () => {
            if (mapInstance.getSource('countries') && mapInstance.isSourceLoaded('countries')) {
              console.log('Source loaded, updating colors...');
              updateCountryColors(mapInstance, assessments);
              setupMapInteractions(mapInstance, assessments);

              // Setup search functionality
              const handleSearch = () => {
                const currentSearchTerm = searchTermRef.current;
                if (!currentSearchTerm) return;

                const searchedAssessment = assessments.find(
                  assessment => assessment.country.toLowerCase().includes(currentSearchTerm.toLowerCase())
                );

                if (searchedAssessment) {
                  try {
                    // Query features for the searched country
                    const features = mapInstance.queryRenderedFeatures({
                      layers: ['country-boundaries'],
                      filter: ['==', ['get', 'name_en'], searchedAssessment.country]
                    });

                    if (features.length > 0) {
                      // Calculate the center of the country
                      const bounds = new mapboxgl.LngLatBounds();
                      features.forEach(feature => {
                        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                          const coords = feature.geometry.type === 'Polygon' 
                            ? [feature.geometry.coordinates[0]]
                            : feature.geometry.coordinates[0];
                          
                          coords.forEach(ring => {
                            ring.forEach((coord: any) => {
                              bounds.extend(coord as mapboxgl.LngLatLike);
                            });
                          });
                        }
                      });

                      // Animate to the country
                      mapInstance.fitBounds(bounds, {
                        padding: 50,
                        maxZoom: 5,
                        duration: 2000,
                        essential: true
                      });

                      // After centering, rotate the map for better view
                      setTimeout(() => {
                        mapInstance.easeTo({
                          bearing: 0,
                          pitch: 45,
                          duration: 2000,
                          essential: true
                        });
                      }, 2000);
                    }
                  } catch (error) {
                    console.error('Error during search:', error);
                  }
                }
              };

              // Handle initial search
              handleSearch();

              // Remove previous event listener if exists
              mapInstance.off('moveend', handleSearch);
              
              // Add event listener for subsequent searches
              mapInstance.on('moveend', handleSearch);
            } else {
              // Keep checking until source is loaded
              requestAnimationFrame(waitForSource);
            }
          };

          waitForSource();
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
