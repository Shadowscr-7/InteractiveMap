import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';
import { useEffect } from 'react';

const StreetRenderer = ({
  map,
  streetSource,
  isMapReady,
  setIsLoading,
  setErrorMessage,
  setLastCoordinates,
  params,
}) => {
  const { pais, departamento, ciudad, calle, numero, esquina } = params;

  useEffect(() => {
    console.log('StreetRenderer params:', params);

    if (!map || !streetSource || !isMapReady) {
      console.debug('Map or streetSource is not ready yet. Skipping rendering.');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(''); // Limpiar mensajes de error previos

        if (!calle && departamento || ciudad) {
          // Buscar centroide del departamento o ciudad
          const locationQuery = [ciudad, departamento, pais].filter(Boolean).join(', ');
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            locationQuery
          )}&format=json&addressdetails=1`;

          const response = await fetch(nominatimUrl, {
            headers: {
              'User-Agent': 'StreetRenderer/1.0 (youremail@example.com)',
            },
          });

          if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Nominatim response for department or city:', data);

          if (data.length > 0) {
            const { lon, lat } = data[0];
            const centerCoordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);

            map.getView().setCenter(centerCoordinates);
            map.getView().setZoom(ciudad ? 12 : 10); // Ajustar nivel de zoom según el alcance (ciudad o departamento)
            setLastCoordinates([parseFloat(lon), parseFloat(lat)]);
          } else {
            setErrorMessage('No se encontraron datos para el departamento o ciudad especificados.');
          }

          return;
        }

        if (calle) {
          console.log('Fetching street data for:', { pais, departamento, ciudad, calle, numero, esquina });

          const queryParts = [
            calle,
            numero ? `${numero}` : '',
            esquina ? `and ${esquina}` : '',
            ciudad,
            departamento,
            pais,
          ]
            .filter(Boolean)
            .join(', ');

          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            queryParts
          )}&format=json&addressdetails=1`;

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

            data.forEach((result) => {
              const [lon, lat] = [parseFloat(result.lon), parseFloat(result.lat)];

              const pointFeature = new Feature({
                geometry: new Point(fromLonLat([lon, lat])),
              });

              pointFeature.setStyle(
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

              streetSource.addFeature(pointFeature);

              // Actualizar las últimas coordenadas
              setLastCoordinates([lon, lat]);

              // Centrar el mapa si es un solo punto
              if (data.length === 1) {
                map.getView().setCenter(fromLonLat([lon, lat]));
                map.getView().setZoom(15); // Nivel de zoom estándar
              }
            });

            // Si hay múltiples puntos, ajustar el mapa para mostrar todos
            if (data.length > 1) {
              const extent = streetSource.getExtent();
              map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
            }
          } else {
            setErrorMessage('No se encontraron puntos para la dirección especificada.');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setErrorMessage('Error al consultar los datos de la dirección.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [map, streetSource, isMapReady, setIsLoading, setErrorMessage, setLastCoordinates, pais, departamento, ciudad, calle, numero, esquina]);

  return null;
};

export default StreetRenderer;
