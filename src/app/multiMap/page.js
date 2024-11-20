'use client';

import { useState, useEffect } from 'react';
import OpenLayersMap from '@/components/GeolocateUsers';
import { getMovilesData } from '@/services/services'; // Importa la función de servicio
import { useRouter, useSearchParams } from 'next/navigation';
import proj4 from 'proj4';

// Función para convertir UTM a latitud/longitud
const utmToLatLong = (easting, northing, zone = 20, hemisphere = 'S') => {
  const utmProjection = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
  const wgs84Projection = `+proj=longlat +datum=WGS84 +no_defs`;
  const isSouthernHemisphere = hemisphere.toUpperCase() === 'S';

  // Ajustar si está en el hemisferio sur
  const northingAdjusted = isSouthernHemisphere ? northing - 10000000 : northing;

  // Convertir coordenadas
  const [longitude, latitude] = proj4(utmProjection, wgs84Projection, [easting, northingAdjusted]);
  return { latitude, longitude };
};

const MultiMapPage = () => {
  const router = useRouter();
  // Estado para manejar los datos de las personas
  const [personas, setPersonas] = useState([]);
  const searchParams = useSearchParams();

  // Obtener los parámetros de la URL
  const escenarioId = searchParams.get('escenarioId') || '';
  const agenciaId = searchParams.get('agenciaId') || '';

  useEffect(() => {
    // Llama al servicio para obtener los datos
    const fetchPersonas = async () => {
      try {
        const data = await getMovilesData(escenarioId, agenciaId);

        // Convertir las coordenadas UTM a latitud/longitud
        const convertedPersonas = data.sdtDataMoviles.map((movil) => {
          const { MovCoordX, MovCoordY, MovId } = movil;

          // Realiza la conversión UTM -> Lat/Lon
          const { latitude, longitude } = utmToLatLong(
            parseFloat(MovCoordX),
            parseFloat(MovCoordY),
            20, // Zona UTM
            'S' // Hemisferio Sur
          );

          return {
            MovId,
            latitude,
            longitude,
          };
        });

        console.log('Personas con coordenadas geográficas:', convertedPersonas);
        setPersonas(convertedPersonas); // Asigna los datos convertidos al estado
      } catch (error) {
        console.error('Error al obtener datos del servicio:', error);
      }
    };

    fetchPersonas();
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h2>Mapa de Personas con Dispositivos</h2>
      <OpenLayersMap personas={personas} />
    </div>
  );
};

export default MultiMapPage;
