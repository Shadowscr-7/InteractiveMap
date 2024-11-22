'use client';

import { useSearchParams } from 'next/navigation';
import MapCompleto from '../../components/mapCompleto';

const Page = () => {
  const searchParams = useSearchParams();

  // Leer parámetros de la URL
  const pais = searchParams.get('pais') || '';
  const departamento = searchParams.get('departamento') || '';
  const ciudad = searchParams.get('ciudad') || '';
  const calle = searchParams.get('calle') || '';
  const numero = searchParams.get('numero') || '';

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <MapCompleto
        pais={pais}
        departamento={departamento}
        ciudad={ciudad}
        calle={calle}
        numero={numero}
      />
    </div>
  );
};

export default Page;
