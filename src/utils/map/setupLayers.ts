import mapboxgl from 'mapbox-gl';

export const setupMapLayers = (map: mapboxgl.Map) => {
  try {
    // Remove existing source and layers if they exist
    if (map.getSource('countries')) {
      if (map.getLayer('country-fills')) map.removeLayer('country-fills');
      if (map.getLayer('country-borders')) map.removeLayer('country-borders');
      map.removeSource('countries');
    }

    // Add source for country boundaries
    map.addSource('countries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1'
    });

    // Add the country fill layer
    map.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: 'countries',
      'source-layer': 'country_boundaries',
      paint: {
        'fill-color': '#cccccc',
        'fill-opacity': 0.4
      }
    });

    // Add country borders
    map.addLayer({
      id: 'country-borders',
      type: 'line',
      source: 'countries',
      'source-layer': 'country_boundaries',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1
      }
    });
  } catch (error) {
    console.error('Error setting up map layers:', error);
  }
};