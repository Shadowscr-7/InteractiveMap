// src/app/multiMap/page.js
'use client';

import { useState, useEffect } from 'react';
import OpenLayersMap from '@/components/GeolocateUsers';
import { getMovilesData } from '@/services/services'; // Importa la función de servicio

const MultiMapPage = () => {
  // Estado para manejar los datos de las personas
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    // Llama al servicio para obtener los datos
    const fetchPersonas = async () => {
      try {
        const data = await getMovilesData(1000); // Puedes pasar el EscenarioId que necesites
        console.log('datos del servicio', data);
        setPersonas(data); // Asigna los datos obtenidos al estado
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
