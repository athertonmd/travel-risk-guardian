import mapboxgl from 'mapbox-gl';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const updateCountryColors = (map: mapboxgl.Map, assessments: RiskAssessment[]) => {
  console.log('Updating country colors with assessments:', assessments);

  // Create a lookup object for quick access to country risk levels
  const countryRiskLevels: { [key: string]: string } = {};
  assessments.forEach(assessment => {
    const countryName = assessment.country.toUpperCase();
    countryRiskLevels[countryName] = assessment.assessment;
    console.log(`Processing country: ${countryName} with risk level: ${assessment.assessment}`);
  });

  // Create the paint expression with uppercase country names
  const entries = Object.entries(countryRiskLevels);
  if (entries.length === 0) {
    // If no assessments, use a simple expression with default color
    map.setPaintProperty('country-fills', 'fill-color', '#cccccc');
    map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
    return;
  }

  // Create the match expression with all required arguments
  const paintExpression: mapboxgl.Expression = [
    'match',
    ['upcase', ['get', 'name_en']],
    ...entries.flatMap(([country, risk]) => [
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