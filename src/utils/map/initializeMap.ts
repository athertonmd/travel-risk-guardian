import mapboxgl from 'mapbox-gl';

export const initializeMap = (
  container: HTMLDivElement,
  mapboxToken: string
): mapboxgl.Map => {
  mapboxgl.accessToken = mapboxToken;
  
  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/light-v11',
    projection: 'globe',
    zoom: 3.5,
    center: [15, 50], // Centered on Europe
    pitch: 45,
  });

  // Add navigation controls
  map.addControl(
    new mapboxgl.NavigationControl({
      visualizePitch: true,
    }),
    'top-right'
  );

  // Add fullscreen control
  map.addControl(
    new mapboxgl.FullscreenControl({
      container: container.parentElement || undefined
    }),
    'top-right'
  );

  return map;
};