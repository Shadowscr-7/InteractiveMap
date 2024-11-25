import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { fromLonLat } from 'ol/proj';
import { useEffect } from 'react';

const StreetRenderer = ({ map, streetSource, isMapReady, setIsLoading, params }) => {
  const { pais, departamento, ciudad, calle, numero, esquina } = params;

  console.log('StreetRenderer params:', params);
  useEffect(() => {
    // Log para verificar que los parámetros están llegando correctamente
    console.log('StreetRenderer params:', params);

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

      console.log('Fetching street data for:', { pais, departamento, ciudad, calle, numero, esquina });

      // Generar consulta específica según el valor de `ciudad`
      const overpassQuery = ciudad
        ? `
          [out:json];
          area["name"="${pais}"]["admin_level"="2"]->.countryArea;
          area["name"="${departamento}"]["admin_level"="4"](area.countryArea)->.searchArea;
          area["name"="${ciudad}"]["admin_level"="8"](area.searchArea)->.cityArea;
          way["name"~"^${calle}$"](area.cityArea);
          out geom;
        `
        : `
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
            map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
          }
        } else {
          console.warn('No street segments found in Overpass API.');
        }
      } catch (error) {
        console.error('Error fetching street data:', error.message);
      } finally {
        setIsLoading(false); // Ocultar capa de carga
      }
    };

    fetchStreetData();
  }, [map, streetSource, isMapReady, setIsLoading, pais, departamento, ciudad, calle, numero, esquina]);

  return null;
};

export default StreetRenderer;
