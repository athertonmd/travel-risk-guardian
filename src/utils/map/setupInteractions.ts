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
  let currentFeature: mapboxgl.MapboxGeoJSONFeature | null = null;

  const handleCountryFeature = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    const countryName = feature.properties?.name_en;
    if (!countryName) return;

    const assessment = assessments.find(
      a => a.country.toLowerCase() === countryName.toLowerCase()
    );

    return assessment;
  };

  const showPopup = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
    if (!e.features || e.features.length === 0) return;
    
    currentFeature = e.features[0];
    const assessment = handleCountryFeature(currentFeature);

    if (assessment) {
      if (!root) {
        root = createRoot(popupContainer);
      }

      root.render(
        React.createElement(CountryPopup, {
          assessment,
          triggerElement: React.createElement('div', {
            style: { padding: '8px' }
          })
        })
      );

      popup.setLngLat(e.lngLat).setDOMContent(popupContainer).addTo(map);

      const popupElement = popup.getElement();
      
      // Add mouseenter handler to popup
      popupElement.addEventListener('mouseenter', () => {
        isHoveringPopup = true;
      });
      
      // Add mouseleave handler to popup
      popupElement.addEventListener('mouseleave', () => {
        isHoveringPopup = false;
        hidePopupIfOutside(e.point);
      });

      // Add wheel event listener to prevent map zoom when scrolling popup
      popupElement.addEventListener('wheel', (e) => {
        e.stopPropagation();
      });
    }
  };

  const hidePopupIfOutside = (point: mapboxgl.Point) => {
    if (isHoveringPopup) return;
    
    if (!map.getLayer('country-fills')) return;
    
    const features = map.queryRenderedFeatures(point, { layers: ['country-fills'] });
    if (features.length === 0 || 
        features[0].properties?.name_en !== currentFeature?.properties?.name_en) {
      popup.remove();
      if (root) {
        root.unmount();
        root = null;
      }
      currentFeature = null;
    }
  };

  // Set up map event listeners
  map.on('mousemove', 'country-fills', (e) => {
    if (isHoveringPopup) return;
    
    map.getCanvas().style.cursor = 'pointer';
    showPopup(e);
  });

  map.on('mouseleave', 'country-fills', (e) => {
    if (isHoveringPopup) return;
    
    map.getCanvas().style.cursor = '';
    hidePopupIfOutside(e.point);
  });

  // Handle click interactions
  map.on('click', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      const assessment = handleCountryFeature(e.features[0]);
      if (assessment && onCountryClick) {
        onCountryClick(assessment.country);
      }
    }
  });
};