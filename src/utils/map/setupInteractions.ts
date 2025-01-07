import mapboxgl from 'mapbox-gl';

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