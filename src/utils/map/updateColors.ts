import mapboxgl from 'mapbox-gl';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const updateCountryColors = (map: mapboxgl.Map, assessments: RiskAssessment[]) => {
  console.log('Updating country colors with assessments:', assessments);

  if (!map || !assessments) {
    console.error('Map or assessments not provided');
    return;
  }

  try {
    // Create a lookup object for quick access to country risk levels
    const countryRiskLevels: { [key: string]: string } = {};
    assessments.forEach(assessment => {
      // Normalize country names to uppercase for consistent matching
      const countryName = assessment.country.toUpperCase();
      countryRiskLevels[countryName] = assessment.assessment;
      console.log(`Processing country: ${countryName} with risk level: ${assessment.assessment}`);
    });

    // Verify the layer exists before attempting to update it
    if (!map.getLayer('country-fills')) {
      console.error('country-fills layer not found');
      return;
    }

    // Create the match expression for color mapping
    const paintExpression: mapboxgl.Expression = [
      'match',
      ['upcase', ['get', 'name_en']],
      ...Object.entries(countryRiskLevels).flatMap(([country, risk]) => [
        country,
        risk === 'extreme' ? '#ef4444' : // red
        risk === 'high' ? '#f97316' :    // orange
        risk === 'medium' ? '#eab308' :  // yellow
        '#22c55e'                        // green for low
      ]),
      '#cccccc' // Default color for countries without assessment
    ];

    console.log('Applying paint expression:', JSON.stringify(paintExpression));
    
    // Set the paint properties
    map.setPaintProperty('country-fills', 'fill-color', paintExpression);
    map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
    
    console.log('Successfully applied paint properties');
  } catch (error) {
    console.error('Error updating country colors:', error);
  }
};