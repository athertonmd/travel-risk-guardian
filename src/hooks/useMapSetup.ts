import { useEffect, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { setupMapLayers, updateCountryColors, setupMapInteractions } from '@/utils/map';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const useMapSetup = (
  map: MutableRefObject<mapboxgl.Map | null>,
  sourceLoadedRef: MutableRefObject<boolean>,
  assessments: RiskAssessment[],
  handleSearch: () => void,
  onCountryClick?: (country: string) => void
) => {
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const setupMap = () => {
      console.log('Style loaded, setting up layers...');
      setupMapLayers(mapInstance);
      
      mapInstance.on('sourcedata', (e) => {
        if (e.sourceId === 'countries' && mapInstance.isSourceLoaded('countries')) {
          if (!sourceLoadedRef.current) {
            console.log('Source loaded for the first time, updating colors...');
            sourceLoadedRef.current = true;
            updateCountryColors(mapInstance, assessments);
            setupMapInteractions(mapInstance, assessments, onCountryClick);
            handleSearch();
          }
        }
      });

      // Add click event handler
      mapInstance.on('click', 'country-fills', (e) => {
        if (e.features && e.features.length > 0) {
          const countryName = e.features[0].properties.name_en;
          const assessment = assessments.find(
            a => a.country.toLowerCase() === countryName.toLowerCase()
          );
          
          if (assessment && onCountryClick) {
            onCountryClick(assessment.country);
          }
        }
      });
    };

    mapInstance.on('style.load', setupMap);

    return () => {
      mapInstance.off('style.load', setupMap);
      mapInstance.off('click', 'country-fills');
    };
  }, [map, sourceLoadedRef, assessments, handleSearch, onCountryClick]);
};