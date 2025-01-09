import { MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { resetMapToDefault, animateToCountry } from '@/utils/map/animations';

export const useMapAnimation = (map: MutableRefObject<mapboxgl.Map | null>) => {
  const resetPosition = () => {
    const mapInstance = map.current;
    if (!mapInstance) return;
    resetMapToDefault(mapInstance);
  };

  const animateToFeatures = (features: mapboxgl.MapboxGeoJSONFeature[]) => {
    const mapInstance = map.current;
    if (!mapInstance || features.length === 0) return;

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

    animateToCountry(mapInstance, bounds);
  };

  return { resetPosition, animateToFeatures };
};