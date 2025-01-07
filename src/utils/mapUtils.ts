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
  console.log('Updating country colors with assessments:', assessments);

  // Create a lookup object for quick access to country risk levels
  const countryRiskLevels: { [key: string]: string } = {};
  assessments.forEach(assessment => {
    const countryName = assessment.country.toUpperCase();
    countryRiskLevels[countryName] = assessment.assessment;
    console.log(`Processing country: ${countryName} with risk level: ${assessment.assessment}`);
  });

  // Create the paint expression
  const paintExpression: mapboxgl.Expression = [
    'match',
    ['get', 'name_en'],
    ...Object.entries(countryRiskLevels).flatMap(([country, risk]) => [
      country,
      risk === 'extreme' ? '#ef4444' :
      risk === 'high' ? '#f97316' :
      risk === 'medium' ? '#eab308' :
      '#22c55e'
    ]),
    '#cccccc' // Default color for countries without assessment
  ];

  console.log('Applying paint expression:', JSON.stringify(paintExpression));

  try {
    map.setPaintProperty('country-fills', 'fill-color', paintExpression);
    map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
    console.log('Successfully applied paint properties');
  } catch (error) {
    console.error('Error applying paint properties:', error);
  }
};

export const setupMapInteractions = (map: mapboxgl.Map) => {
  map.on('mousemove', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      const feature = e.features[0];
      const countryName = feature.properties.name_en;
      const color = map.getPaintProperty('country-fills', 'fill-color');
      console.log('Hovering over country:', countryName, 'Current color expression:', color);
    }
  });

  map.on('mouseleave', 'country-fills', () => {
    map.getCanvas().style.cursor = '';
  });
};