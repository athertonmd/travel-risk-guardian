import mapboxgl from 'mapbox-gl';

export const initializeMap = (
  container: HTMLDivElement,
  mapboxToken: string
): mapboxgl.Map => {
  mapboxgl.accessToken = mapboxToken;
  
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/light-v11',
    projection: 'globe',
    zoom: 2.5,
    center: [15, 50], // Centered on Europe
    pitch: 45,
  });
};