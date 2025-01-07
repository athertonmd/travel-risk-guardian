import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapbox } from "@/hooks/useMapbox";
import { MapContainer } from "@/components/map/MapContainer";

interface RiskAssessment {
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
}

interface RiskMapProps {
  assessments: RiskAssessment[];
}

const RiskMap = ({ assessments }: RiskMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { mapboxToken, isLoading, error } = useMapbox();

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Initialize map only if not already initialized
      if (!map.current) {
        mapboxgl.accessToken = mapboxToken;
        
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          projection: 'globe',
          zoom: 3.5, // Increased zoom level for better view of Europe
          center: [15, 50], // Centered on Europe (approximately central Europe)
          pitch: 45,
        });

        // Add navigation controls
        mapInstance.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        map.current = mapInstance;

        // Add color-coding when the map style is loaded
        mapInstance.on('style.load', () => {
          // Add a data source for countries
          mapInstance.addSource('countries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
          });

          // Add a layer for country fills
          mapInstance.addLayer({
            id: 'country-fills',
            type: 'fill',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
              'fill-color': [
                'case',
                ['==', ['get', 'risk_level'], 'extreme'], '#ef4444', // red
                ['==', ['get', 'risk_level'], 'high'], '#f97316', // orange
                ['==', ['get', 'risk_level'], 'medium'], '#eab308', // yellow
                ['==', ['get', 'risk_level'], 'low'], '#22c55e', // green
                'rgba(0, 0, 0, 0)' // default transparent
              ],
              'fill-opacity': 0.5
            }
          });

          // Add a layer for country borders
          mapInstance.addLayer({
            id: 'country-borders',
            type: 'line',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
              'line-color': '#ffffff',
              'line-width': 1
            }
          });

          // Update country colors based on risk assessments
          const setCountryColors = () => {
            const countryFeatures = assessments.map(assessment => ({
              type: 'Feature',
              properties: {
                risk_level: assessment.assessment,
                name: assessment.country
              },
              geometry: null
            }));

            if (mapInstance.getSource('risk-data')) {
              (mapInstance.getSource('risk-data') as mapboxgl.GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: countryFeatures
              });
            }
          };

          setCountryColors();
        });

        // Add hover effect
        mapInstance.on('mousemove', 'country-fills', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const riskLevel = feature.properties.risk_level;
            if (riskLevel) {
              mapInstance.getCanvas().style.cursor = 'pointer';
              // You could add a popup here if desired
            }
          }
        });

        mapInstance.on('mouseleave', 'country-fills', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, assessments]);

  return (
    <MapContainer isLoading={isLoading} error={error}>
      <div ref={mapContainer} className="w-full h-full" />
    </MapContainer>
  );
};

export default RiskMap;