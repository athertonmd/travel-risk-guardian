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
  const sourceLoadedRef = useRef(false);

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
          
          // Listen for the source loading
          mapInstance.on('sourcedata', (e) => {
            if (e.sourceId === 'countries' && mapInstance.isSourceLoaded('countries')) {
              if (!sourceLoadedRef.current) {
                console.log('Source loaded for the first time, updating colors...');
                sourceLoadedRef.current = true;
                updateCountryColors(mapInstance, assessments);
                setupMapInteractions(mapInstance, assessments);
                handleSearch();
              }
            }
          });
        });

        // Setup search functionality
        const handleSearch = () => {
          if (!mapInstance.isStyleLoaded() || !sourceLoadedRef.current) {
            console.log('Map or source not ready yet, skipping search');
            return;
          }

          const currentSearchTerm = searchTermRef.current.toLowerCase();
          if (!currentSearchTerm) return;

          const searchedAssessment = assessments.find(
            assessment => assessment.country.toLowerCase().includes(currentSearchTerm)
          );

          if (searchedAssessment) {
            try {
              const features = mapInstance.querySourceFeatures('countries', {
                sourceLayer: 'country_boundaries',
                filter: ['==', ['downcase', ['get', 'name_en']], searchedAssessment.country.toLowerCase()]
              });

              if (features.length > 0) {
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

                mapInstance.fitBounds(bounds, {
                  padding: 50,
                  maxZoom: 5,
                  duration: 2000
                });

                setTimeout(() => {
                  mapInstance.easeTo({
                    bearing: 0,
                    pitch: 45,
                    duration: 2000
                  });
                }, 2000);
              }
            } catch (error) {
              console.error('Error during search:', error);
            }
          }
        };

        // Handle initial search
        if (searchTerm) {
          handleSearch();
        }

        // Add event listener for subsequent searches
        mapInstance.on('moveend', handleSearch);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        sourceLoadedRef.current = false;
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