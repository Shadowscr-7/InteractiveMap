'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import OpenLayersMap from '../components/OpenLayersMap';
import WebSocketClient from '../components/WebSocketClient';
import { useEffect, useState } from 'react';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener los parámetros de la URL
  const pais = searchParams.get('pais') || '';
  const departamento = searchParams.get('departamento') || '';
  const ciudad = searchParams.get('ciudad') || '';
  const calle = searchParams.get('calle') || '';
  const numero = searchParams.get('numero') || '';

  const [location, setLocation] = useState({ pais, departamento, ciudad, calle, numero });

  // Función para manejar la actualización de ubicación desde el componente de mapa
  const handleLocationChange = (newLocation: { pais: string; departamento: string; ciudad: string; calle: string; numero: string }) => {
    setLocation(newLocation);
    
    // Actualizar la URL con los nuevos parámetros
    const params = new URLSearchParams(newLocation);
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <OpenLayersMap 
        pais={location.pais}
        departamento={location.departamento}
        ciudad={location.ciudad}
        calle={location.calle}
        numero={location.numero}
        onLocationChange={handleLocationChange}
      />
      {/* Colocar el componente WebSocket debajo del mapa */}
      <WebSocketClient />
    </div>
    
  );
};

export default Page;
