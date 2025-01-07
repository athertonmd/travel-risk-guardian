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
    zoom: 1.5,
    center: [0, 20],
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
  if (!map.isStyleLoaded()) return;

  // Create a lookup object for quick access to country risk levels
  const countryRiskLevels: { [key: string]: string } = {};
  assessments.forEach(assessment => {
    countryRiskLevels[assessment.country.toUpperCase()] = assessment.assessment;
  });

  // Set a filter and color expression for the fill layer
  const fillColor = [
    'case',
    ['in', ['get', 'name_en'], ['literal', Object.keys(countryRiskLevels)]],
    [
      'match',
      ['get', 'name_en'],
      ...Object.entries(countryRiskLevels).flatMap(([country, risk]) => [
        country,
        risk === 'extreme' ? '#ef4444' :
        risk === 'high' ? '#f97316' :
        risk === 'medium' ? '#eab308' :
        '#22c55e' // low risk
      ]),
      '#cccccc' // default color for countries without assessment
    ],
    '#cccccc' // default color for countries without assessment
  ];

  map.setPaintProperty('country-fills', 'fill-color', fillColor);
  map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
};

export const setupMapInteractions = (map: mapboxgl.Map) => {
  // Add hover effect
  map.on('mousemove', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
    }
  });

  map.on('mouseleave', 'country-fills', () => {
    map.getCanvas().style.cursor = '';
  });
};