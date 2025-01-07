import mapboxgl from 'mapbox-gl';
import React from 'react';
import ReactDOM from 'react-dom';
import { CountryPopup } from '@/components/map/CountryPopup';
import { RiskAssessment } from '@/components/dashboard/RiskMap';

export const setupMapInteractions = (map: mapboxgl.Map, assessments: RiskAssessment[]) => {
  // Create a container for the popup
  const popupContainer = document.createElement('div');
  let currentPopup: mapboxgl.Popup | null = null;

  map.on('mousemove', 'country-fills', (e) => {
    if (e.features && e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      const feature = e.features[0];
      const countryName = feature.properties.name_en;
      
      // Find assessment for this country
      const assessment = assessments.find(
        a => a.country.toLowerCase() === countryName.toLowerCase()
      );

      if (assessment) {
        // Remove existing popup if any
        if (currentPopup) {
          currentPopup.remove();
        }

        // Create new popup
        currentPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'country-popup'
        })
          .setLngLat(e.lngLat)
          .setDOMContent(popupContainer);

        // Render React component into popup
        ReactDOM.render(
          React.createElement(CountryPopup, {
            assessment,
            triggerElement: React.createElement('div')
          }),
          popupContainer
        );

        currentPopup.addTo(map);
      }
    }
  });

  map.on('mouseleave', 'country-fills', () => {
    map.getCanvas().style.cursor = '';
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }
  });
};