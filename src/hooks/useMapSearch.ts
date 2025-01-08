import { useEffect, useRef, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const useMapSearch = (
  map: MutableRefObject<mapboxgl.Map | null>,
  sourceLoadedRef: MutableRefObject<boolean>,
  searchTerm: string,
  assessments: RiskAssessment[]
) => {
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const handleSearch = () => {
    const mapInstance = map.current;
    if (!mapInstance?.isStyleLoaded() || !sourceLoadedRef.current) {
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

          // First, rotate the map 360 degrees
          mapInstance.easeTo({
            bearing: 360,
            duration: 2000,
            pitch: 0
          });

          // After rotation, fit to bounds with pitch
          setTimeout(() => {
            mapInstance.fitBounds(bounds, {
              padding: 100,
              maxZoom: 6,
              duration: 2000
            });

            // After fitting bounds, add some pitch for 3D effect
            setTimeout(() => {
              mapInstance.easeTo({
                bearing: 0,
                pitch: 60,
                duration: 1500
              });
            }, 2000);
          }, 2000);
        }
      } catch (error) {
        console.error('Error during search:', error);
      }
    }
  };

  return { handleSearch };
};