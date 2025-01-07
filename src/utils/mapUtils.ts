import mapboxgl from 'mapbox-gl';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

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

export const setupMapLayers = (map: mapboxgl.Map) => {
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
};

export const updateCountryColors = (map: mapboxgl.Map, assessments: RiskAssessment[]) => {
  if (!map.isStyleLoaded()) {
    console.log('Map style not loaded yet');
    return;
  }

  // Create a lookup object for quick access to country risk levels
  const countryRiskLevels: { [key: string]: string } = {};
  assessments.forEach(assessment => {
    const countryName = assessment.country.toUpperCase();
    countryRiskLevels[countryName] = assessment.assessment;
    console.log(`Added country: ${countryName} with risk level: ${assessment.assessment}`);
  });

  // Create the match expression for Mapbox
  const matchExpression: mapboxgl.Expression = [
    'match',
    ['upcase', ['get', 'name_en']],
    ...Object.entries(countryRiskLevels).flatMap(([country, risk]) => [
      country,
      risk === 'extreme' ? '#ef4444' :
      risk === 'high' ? '#f97316' :
      risk === 'medium' ? '#eab308' :
      '#22c55e'
    ]),
    '#cccccc' // Default color for countries without assessment
  ];

  console.log('Setting paint property with expression:', JSON.stringify(matchExpression));

  // Update the layer's paint property
  map.setPaintProperty('country-fills', 'fill-color', matchExpression);
  map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
};

export const setupMapInteractions = (map: mapboxgl.Map) => {
  // Add hover effect
  map.on('mousemove', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      
      // Log the country name and its current color
      const feature = e.features[0];
      console.log('Hovering over country:', feature.properties.name_en);
    }
  });

  map.on('mouseleave', 'country-fills', () => {
    map.getCanvas().style.cursor = '';
  });
};