import { useEffect, useRef, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMap } from '@/utils/map';

export const useMapInitialization = (
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  mapboxToken: string
) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const sourceLoadedRef = useRef(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      if (!map.current) {
        const mapInstance = initializeMap(mapContainer.current, mapboxToken);
        map.current = mapInstance;
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
  }, [mapboxToken, mapContainer]);

  return { map, sourceLoadedRef };
};