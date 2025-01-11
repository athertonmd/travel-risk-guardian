import mapboxgl from 'mapbox-gl';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CountryPopup } from '@/components/map/CountryPopup';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const setupMapInteractions = (
  map: mapboxgl.Map, 
  assessments: RiskAssessment[],
  onCountryClick?: (country: string) => void
) => {
  // Create a popup
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: 'country-popup',
    maxWidth: 'none'
  });

  // Create a container for the popup content
  const popupContainer = document.createElement('div');
  let root: ReturnType<typeof createRoot> | null = null;
  let isHoveringPopup = false;

  const handleCountryFeature = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    const countryName = feature.properties?.name_en;
    if (!countryName) return;

    const assessment = assessments.find(
      a => a.country.toLowerCase() === countryName.toLowerCase()
    );

    return assessment;
  };

  map.on('mousemove', 'country-fills', (e) => {
    if (isHoveringPopup) return; // Don't update popup if user is interacting with it
    
    if (e.features && e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      const assessment = handleCountryFeature(e.features[0]);

      if (assessment) {
        // Create new root if it doesn't exist
        if (!root) {
          root = createRoot(popupContainer);
        }

        // Render the popup content
        root.render(
          React.createElement(CountryPopup, {
            assessment,
            triggerElement: React.createElement('div', {
              style: { padding: '8px' }
            })
          })
        );

        // Set the popup location
        popup.setLngLat(e.lngLat).setDOMContent(popupContainer).addTo(map);

        // Add mouseenter/mouseleave handlers to popup
        const popupElement = popup.getElement();
        popupElement.addEventListener('mouseenter', () => {
          isHoveringPopup = true;
        });
        
        popupElement.addEventListener('mouseleave', () => {
          isHoveringPopup = false;
          if (!map.getLayer('country-fills')) return;
          const features = map.queryRenderedFeatures(e.point, { layers: ['country-fills'] });
          if (features.length === 0) {
            popup.remove();
            if (root) {
              root.unmount();
              root = null;
            }
          }
        });
      }
    }
  });

  map.on('mouseleave', 'country-fills', (e) => {
    if (isHoveringPopup) return; // Don't remove popup if user is interacting with it
    
    map.getCanvas().style.cursor = '';
    popup.remove();
    if (root) {
      root.unmount();
      root = null;
    }
  });

  // Handle both hover and click interactions
  map.on('click', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      const assessment = handleCountryFeature(e.features[0]);
      if (assessment && onCountryClick) {
        onCountryClick(assessment.country);
      }
    }
  });
};