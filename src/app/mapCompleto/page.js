'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MapCompleto from '../../components/mapCompleto';
import StreetRenderer from '../../components/streetRenderer';

const Page = () => {
  const searchParams = useSearchParams();

  const pais = searchParams.get('pais') || '';
  const departamento = searchParams.get('departamento') || '';
  const ciudad = searchParams.get('ciudad') || '';
  const calle = searchParams.get('calle') || '';
  const numero = searchParams.get('numero') || '';
  const esquina = searchParams.get('esquina') || '';

  useEffect(() => {
    // Sobrescribir el manejo global de errores
    const handleError = (event) => {
      const errorMessage = event?.message || (event.reason?.message ?? event.reason) || "";
      if (errorMessage.includes('map is null')) {
        console.debug('Silenced global error: map is null');
        event.preventDefault(); // Evitar que se registre en la consola
      }
    };
  
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
  
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <MapCompleto
  pais={pais}
  departamento={departamento}
  calle={calle}
  ciudad={ciudad}
  numero={numero}
  esquina={esquina}
>
  <StreetRenderer params={{ pais, departamento, ciudad, calle, numero, esquina }} />
</MapCompleto>

  );
};

export default Page;
