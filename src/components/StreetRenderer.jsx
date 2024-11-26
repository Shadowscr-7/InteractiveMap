import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';
import { useEffect, useRef } from 'react';

const StreetRenderer = ({ map, params, isMapReady }) => {
  const { departamento, calle, pais, numero, esquina, ciudad } = params;
  const streetSource = useRef(new VectorSource()); // Persistencia de la fuente para los datos de la calle
  const markerSource = useRef(new VectorSource()); // Fuente para los marcadores

  useEffect(() => {
    if (!map || !isMapReady) {
      console.debug('Map or isMapReady is not ready yet. Skipping rendering.');
      return; // Detener ejecución si el mapa no está listo
    }

    const fetchStreetData = async () => {
      if (!departamento || !calle || !pais || numero || esquina) {
        console.debug('Skipping street rendering as markers take precedence.');
        return; // Evitar pintar la calle si se pasa número o esquina
      }

      console.log('Fetching street data for:', { departamento, calle, pais, ciudad });

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
                    color: 'blue', // Color de la calle
                    width: 4, // Ancho de la línea
                  }),
                })
              );

              return feature;
            });

          console.log('Features created:', features);
          streetSource.current.addFeatures(features);

          // Ajustar la vista del mapa al contenido
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

    const fetchMarkerData = async () => {
      if (!calle || (!numero && !esquina)) {
        console.debug('Skipping marker rendering: Calle, Numero or Esquina not provided.');
        return;
      }

      console.log('Fetching marker data for:', { calle, numero, esquina });

      const locationQuery = `${calle} ${numero ? `#${numero}` : ''} ${
        esquina ? `y ${esquina}` : ''
      }, ${ciudad || ''}, ${departamento}, ${pais}`;
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        locationQuery
      )}&format=json&addressdetails=1`;

      try {
        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'StreetRenderer/1.0 (youremail@example.com)',
          },
        });

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Nominatim response:', data);

        if (data.length > 0) {
          markerSource.current.clear(); // Limpiar marcadores previos

          const markers = data.map((result) => {
            const [lon, lat] = [parseFloat(result.lon), parseFloat(result.lat)];

            const marker = new Feature({
              geometry: new Point(fromLonLat([lon, lat])),
            });

            marker.setStyle(
              new Style({
                image: new Icon({
                  anchor: [0.5, 1], // Anclaje del marcador
                  src:
                    'data:image/svg+xml;charset=utf-8,' +
                    encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  `),
                  scale: 1,
                }),
              })
            );

            return marker;
          });

          console.log('Markers created:', markers);
          markerSource.current.addFeatures(markers);

          // Centrar el mapa en el primer marcador
          if (markers.length === 1) {
            const [lon, lat] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            map.getView().setCenter(fromLonLat([lon, lat]));
            map.getView().setZoom(17); // Zoom cercano para marcadores individuales
          }
        } else {
          console.warn('No markers found for the given parameters.');
        }
      } catch (error) {
        console.error('Error fetching marker data:', error.message);
      }
    };

    if (numero || esquina) {
      fetchMarkerData(); // Priorizar los marcadores si se pasan
    } else {
      fetchStreetData(); // Pintar la calle si no hay marcadores
    }
  }, [map, isMapReady, departamento, calle, pais, numero, esquina, ciudad]);

  useEffect(() => {
    console.log('Adding street and marker layers...');
    const streetLayer = new VectorLayer({
      source: streetSource.current,
    });
    const markerLayer = new VectorLayer({
      source: markerSource.current,
    });

    map.addLayer(streetLayer);
    map.addLayer(markerLayer);

    return () => {
      console.log('Removing street and marker layers...');
      map.removeLayer(streetLayer);
      map.removeLayer(markerLayer);
    };
  }, [map]);

  return null;
};

export default StreetRenderer;
