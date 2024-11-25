import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { fromLonLat } from 'ol/proj';
import { useEffect } from 'react';

const StreetRenderer = ({ map, streetSource, isMapReady, setIsLoading, params }) => {
  const { departamento, calle, pais } = params;

  useEffect(() => {
    if (!map || !streetSource || !isMapReady) {
      console.debug('Map or streetSource is not ready yet. Skipping rendering.');
      return;
    }

    const fetchStreetData = async () => {
      if (!departamento || !calle || !pais) {
        console.warn('Missing required parameters: departamento, calle, or pais.');
        setIsLoading(false); // Detener la carga si faltan parámetros
        return;
      }

      console.log('Fetching street data for:', { departamento, calle, pais });

      const overpassQuery = `
        [out:json];
        area["name"="${pais}"]["admin_level"="2"]->.countryArea;
        area["name"="${departamento}"]["admin_level"="4"](area.countryArea)->.searchArea;
        way["name"~"^${calle}$"](area.searchArea);
        out geom;
      `;

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      try {
        setIsLoading(true); // Mostrar capa de carga
        const response = await fetch(overpassUrl, {
          headers: {
            'User-Agent': 'StreetRenderer/1.0 (youremail@example.com)',
          },
        });

        if (!response.ok) {
          console.error(`Overpass API error: ${response.status} ${response.statusText}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Overpass response:', data);

        if (data.elements && data.elements.length > 0) {
          streetSource.clear();

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

          streetSource.addFeatures(features);

          const extent = streetSource.getExtent();
          if (extent && extent.every((value) => value !== Infinity)) {
            console.log('Fitting map to extent:', extent);

            // Ajustar la vista y esperar al evento "moveend"
            map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });

            const onMoveEnd = () => {
              console.log('Map animation ended.');
              setIsLoading(false); // Ocultar capa de carga al finalizar el zoom
              map.un('moveend', onMoveEnd); // Desregistrar el evento
            };

            map.on('moveend', onMoveEnd); // Registrar el evento
          }
        } else {
          console.warn('No street segments found in Overpass API.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching street data:', error.message);
        setIsLoading(false);
      }
    };

    fetchStreetData();
  }, [map, streetSource, isMapReady, setIsLoading, departamento, calle, pais]);

  return null;
};

export default StreetRenderer;
