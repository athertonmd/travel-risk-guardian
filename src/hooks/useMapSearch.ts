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
        console.log(`Searching for country: ${searchedAssessment.country}`);
        
        // Query for the country features
        const features = mapInstance.querySourceFeatures('countries', {
          sourceLayer: 'country_boundaries',
          filter: ['==', ['downcase', ['get', 'name_en']], searchedAssessment.country.toLowerCase()]
        });

        if (features.length > 0) {
          console.log(`Found ${features.length} features for ${searchedAssessment.country}`);
          
          // Calculate bounds for the country
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

          // Start the animation sequence
          console.log('Starting animation sequence');
          
          // First, rotate the map 360 degrees
          mapInstance.easeTo({
            bearing: 360,
            duration: 2000,
            pitch: 0
          });

          // After rotation, fit to bounds
          setTimeout(() => {
            console.log('Fitting to bounds');
            mapInstance.fitBounds(bounds, {
              padding: { top: 100, bottom: 100, left: 100, right: 100 },
              maxZoom: 6,
              duration: 2000
            });

            // After fitting bounds, add some pitch for 3D effect
            setTimeout(() => {
              console.log('Applying final pitch');
              mapInstance.easeTo({
                bearing: 0,
                pitch: 60,
                duration: 1500
              });
            }, 2000);
          }, 2000);
        } else {
          console.log(`No features found for ${searchedAssessment.country}`);
        }
      } catch (error) {
        console.error('Error during search:', error);
      }
    }
  };

  // Trigger search when searchTerm changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  return { handleSearch };
};