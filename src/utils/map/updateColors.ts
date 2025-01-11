import mapboxgl from 'mapbox-gl';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const updateCountryColors = (map: mapboxgl.Map, assessments: RiskAssessment[]) => {
  console.log('Updating country colors with assessments:', assessments);

  try {
    // Create a lookup object for quick access to country risk levels
    const countryRiskLevels: { [key: string]: string } = {};
    assessments.forEach(assessment => {
      countryRiskLevels[assessment.country.toUpperCase()] = assessment.assessment;
      console.log(`Processing country: ${assessment.country} with risk level: ${assessment.assessment}`);
    });

    // Create the match expression for risk levels
    const paintExpression: mapboxgl.Expression = [
      'match',
      ['upcase', ['get', 'name_en']],
      ...Object.entries(countryRiskLevels).flatMap(([country, risk]) => [
        country,
        getRiskColor(risk)
      ]),
      '#e5e7eb' // Default color for countries without assessment
    ];

    // Apply the paint properties to the map
    if (map.getLayer('country-fills')) {
      console.log('Applying paint expression:', JSON.stringify(paintExpression));
      map.setPaintProperty('country-fills', 'fill-color', paintExpression);
      map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
      console.log('Successfully applied paint properties');
    } else {
      console.error('country-fills layer not found');
    }
  } catch (error) {
    console.error('Error updating country colors:', error);
  }
};

// Helper function to get color based on risk level
const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'extreme':
      return '#ef4444'; // Red
    case 'high':
      return '#f97316'; // Orange
    case 'medium':
      return '#eab308'; // Yellow
    case 'low':
      return '#22c55e'; // Green
    default:
      return '#e5e7eb'; // Gray
  }
};