import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';
import { useEffect } from 'react';

const StreetRenderer = ({ map, streetSource, isMapReady, setIsLoading, params }) => {
  const { pais, departamento, ciudad, calle, numero, esquina } = params;

  useEffect(() => {
    console.log('StreetRenderer params:', params);

    if (!map || !streetSource || !isMapReady) {
      console.debug('Map or streetSource is not ready yet. Skipping rendering.');
      return;
    }

    const fetchData = async () => {
      if (!departamento || !calle || !pais) {
        console.warn('Missing required parameters: departamento, calle, or pais.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching street data for:', { pais, departamento, ciudad, calle, numero, esquina });

      if (numero || esquina) {
        // Usar Nominatim para buscar puntos específicos
        const queryParts = [
          calle,
          numero ? `${numero}` : '',
          esquina ? `and ${esquina}` : '',
          ciudad,
          departamento,
          pais,
        ].filter(Boolean).join(', ');

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryParts)}&format=json&addressdetails=1`;

        try {
          setIsLoading(true);
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
            streetSource.clear(); // Limpiar puntos anteriores

            data.forEach((result, index) => {
              const [lon, lat] = [parseFloat(result.lon), parseFloat(result.lat)];

              const pointFeature = new Feature({
                geometry: new Point(fromLonLat([lon, lat])),
              });

              pointFeature.setStyle(
                new Style({
                  image: new Icon({
                    anchor: [0.5, 1], // Anclaje del marcador
                    src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    `),
                    scale: 1, // Tamaño del marcador
                  }),
                })
              );

              streetSource.addFeature(pointFeature);

              // Centrar el mapa y ajustar el zoom si es un solo punto
              if (data.length === 1) {
                map.getView().setCenter(fromLonLat([lon, lat]));
                map.getView().setZoom(15); // Nivel de zoom más alejado
              }
            });

            // Si hay múltiples puntos, ajustar el mapa para mostrar todos
            if (data.length > 1) {
              const extent = streetSource.getExtent();
              map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
          } else {
            console.warn('No points found in Nominatim for the given address.');
          }
        } catch (error) {
          console.error('Error fetching point data from Nominatim:', error.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Usar Overpass si no hay `numero` o `esquina`
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
          setIsLoading(true);
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
          console.error('Error fetching street data from Overpass:', error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [map, streetSource, isMapReady, setIsLoading, pais, departamento, ciudad, calle, numero, esquina]);

  return null;
};

export default StreetRenderer;
