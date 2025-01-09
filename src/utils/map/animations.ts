import mapboxgl from 'mapbox-gl';

export const resetMapToDefault = (map: mapboxgl.Map) => {
  if (!map.isStyleLoaded()) return;

  map.easeTo({
    center: [15, 50],
    zoom: 3.5,
    pitch: 45,
    bearing: 0,
    duration: 2000
  });
};

export const animateToCountry = (map: mapboxgl.Map, bounds: mapboxgl.LngLatBounds) => {
  // First, rotate the map 360 degrees
  map.easeTo({
    bearing: 360,
    duration: 2000,
    pitch: 0
  });

  // After rotation, fit to bounds
  setTimeout(() => {
    map.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 100, right: 100 },
      maxZoom: 6,
      duration: 2000
    });

    // After fitting bounds, add some pitch for 3D effect
    setTimeout(() => {
      map.easeTo({
        bearing: 0,
        pitch: 60,
        duration: 1500
      });
    }, 2000);
  }, 2000);
};