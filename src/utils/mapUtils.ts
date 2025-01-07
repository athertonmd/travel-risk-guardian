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
    zoom: 3.5,
    center: [15, 50],
    pitch: 45,
  });
};

export const setupMapLayers = (map: mapboxgl.Map) => {
  map.addSource('countries', {
    type: 'vector',
    url: 'mapbox://mapbox.country-boundaries-v1'
  });

  map.addLayer({
    id: 'country-fills',
    type: 'fill',
    source: 'countries',
    'source-layer': 'country_boundaries',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'risk_level'], 'extreme'], '#ef4444',
        ['==', ['get', 'risk_level'], 'high'], '#f97316',
        ['==', ['get', 'risk_level'], 'medium'], '#eab308',
        ['==', ['get', 'risk_level'], 'low'], '#22c55e',
        'rgba(0, 0, 0, 0)'
      ],
      'fill-opacity': 0.5
    }
  });

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
  const countryFeatures = assessments.map(assessment => ({
    type: 'Feature' as const,
    properties: {
      risk_level: assessment.assessment,
      name: assessment.country
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [0, 0]
    }
  }));

  if (map.getSource('risk-data')) {
    (map.getSource('risk-data') as mapboxgl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: countryFeatures
    });
  }
};

export const setupMapInteractions = (map: mapboxgl.Map) => {
  map.on('mousemove', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const riskLevel = feature.properties.risk_level;
      if (riskLevel) {
        map.getCanvas().style.cursor = 'pointer';
      }
    }
  });

  map.on('mouseleave', 'country-fills', () => {
    map.getCanvas().style.cursor = '';
  });
};