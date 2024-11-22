import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { fromLonLat } from 'ol/proj';
import { useEffect, useRef } from 'react';

const StreetRenderer = ({ map, params }) => {
  const { departamento, calle, pais } = params;
  const streetSource = useRef(new VectorSource()); // Fuente persistente para los tramos de la calle

  useEffect(() => {
    const fetchStreetData = async () => {
      if (!departamento || !calle || !pais) {
        console.warn('Missing required parameters: departamento, calle, or pais.');
        return;
      }

      console.log('Fetching street data for:', { departamento, calle, pais });

      // Consulta dinámica para Overpass Turbo
      const overpassQuery = `
        [out:json];
        area["name"="${pais}"]["admin_level"="2"]->.countryArea;
        area["name"="${departamento}"]["admin_level"="4"](area.countryArea)->.searchArea;
        way["name"~"^${calle}$"](area.searchArea);
        out geom;
      `;

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      try {
        const response = await fetch(overpassUrl, {
          headers: {
            'User-Agent': 'StreetRenderer/1.0 (youremail@example.com)',
          },
        });

        if (!response.ok) {
          throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Overpass response:', data);

        if (data.elements && data.elements.length > 0) {
          streetSource.current.clear(); // Limpiar datos previos

          const features = data.elements
            .filter((element) => element.type === 'way' && element.geometry)
            .map((way) => {
              const coordinates = way.geometry.map(({ lon, lat }) => fromLonLat([lon, lat]));

              const feature = new Feature({
                geometry: new LineString(coordinates),
              });

              feature.setStyle(
                new Style({
                  stroke: new Stroke({
                    color: 'blue',
                    width: 4,
                  }),
                })
              );

              return feature;
            });

          console.log('Features created:', features);

          // Agregar todas las features al mapa
          streetSource.current.addFeatures(features);

          // Centrar el mapa en la extensión total de las calles
          const extent = streetSource.current.getExtent();
          if (extent && extent.every((value) => value !== Infinity)) {
            console.log('Fitting map to extent:', extent);
            map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
          } else {
            console.warn('No valid extent found for the street features.');
          }
        } else {
          console.warn('No street segments found in Overpass API.');
        }
      } catch (error) {
        console.error('Error fetching street data:', error.message);
      }
    };

    fetchStreetData();
  }, [map, departamento, calle, pais]);

  useEffect(() => {
    console.log('Adding street layer...');
    const streetLayer = new VectorLayer({
      source: streetSource.current,
    });
    map.addLayer(streetLayer);

    return () => {
      console.log('Removing street layer...');
      map.removeLayer(streetLayer);
    };
  }, [map]);

  return null;
};

export default StreetRenderer;
