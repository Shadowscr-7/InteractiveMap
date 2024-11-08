// src/app/multiMap/page.js
'use client';

import { useState, useEffect } from 'react';
import OpenLayersMap from '@/components/GeolocateUsers';
import { mockData } from '@/data/mockData';

const MultiMapPage = () => {
  // Estado para manejar los datos de las personas
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    // Cargar los datos mockeados (simulación de llamada a un servicio)
    setPersonas(mockData);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h2>Mapa de Personas con Dispositivos</h2>
      <OpenLayersMap personas={personas} />
    </div>
  );
};

export default MultiMapPage;
