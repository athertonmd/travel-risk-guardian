import { useEffect, useRef, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { RiskAssessment } from '@/components/dashboard/RiskMap';
import { useMapAnimation } from './useMapAnimation';

export const useMapSearch = (
  map: MutableRefObject<mapboxgl.Map | null>,
  sourceLoadedRef: MutableRefObject<boolean>,
  searchTerm: string,
  assessments: RiskAssessment[]
) => {
  const searchTermRef = useRef(searchTerm);
  const { resetPosition, animateToFeatures } = useMapAnimation(map);

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
    if (!currentSearchTerm) {
      resetPosition();
      return;
    }

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
          animateToFeatures(features);
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