'use client';

import { useState } from 'react';

const ImportForm = () => {
  const [pais, setPais] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchData = async () => {
    if (!pais || !departamento) {
      alert('Por favor, complete ambos campos: País y Departamento.');
      return;
    }

    setLoading(true);

    try {
      console.log('Obteniendo calles del departamento desde Overpass...');

      // Consulta a Overpass para obtener las calles
      const overpassQuery = `
        [out:json];
        area["name"="Uruguay"]["admin_level"="2"]->.country;
        area["name"="${departamento}"]["admin_level"="4"](area.country)->.searchArea;
        (
          way["highway"]["name"](area.searchArea);
        );
        out tags;
      `;
      console.log('Consulta Overpass API:', overpassQuery);

      const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: overpassQuery,
      });

      if (!overpassResponse.ok) {
        throw new Error(`Error en Overpass API: ${overpassResponse.status}`);
      }

      const overpassData = await overpassResponse.json();
      console.log('Datos obtenidos de Overpass API:', overpassData);

      const uniqueStreets = Array.from(
        new Map(
          overpassData.elements.map((way) => [
            way.tags.name,
            { name: way.tags.name, old_name: way.tags.old_name || 'N/A' },
          ])
        ).values()
      );

      console.log('Calles normalizadas:', uniqueStreets);

      const enrichedStreets = [];

      for (const street of uniqueStreets) {
        console.log(`Consultando Nominatim para la calle: ${street.name}`);

        // Llamada a Nominatim
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          street.name
        )}, ${departamento}, ${pais}&format=json&addressdetails=1`;

        console.log('Consulta Nominatim:', nominatimUrl);

        try {
          const nominatimResponse = await fetch(nominatimUrl, {
            headers: { 'User-Agent': 'YourAppName/1.0' },
          });

          if (!nominatimResponse.ok) {
            throw new Error(`Error en Nominatim para ${street.name}`);
          }

          const nominatimData = await nominatimResponse.json();
          console.log(`Datos de Nominatim para ${street.name}:`, nominatimData);

          const localidad = nominatimData[0]?.address?.city || 'Desconocido';
          const barrio = nominatimData[0]?.address?.suburb || 'Desconocido';

          enrichedStreets.push({
            ...street,
            localidad,
            barrio,
          });
        } catch (error) {
          console.warn(`Error consultando Nominatim para ${street.name}:`, error.message);
          enrichedStreets.push({ ...street, localidad: 'Error', barrio: 'Error' });
        }

        // Retraso de 1 segundo entre solicitudes
        await delay(1000);
      }

      setResultados(enrichedStreets);
    } catch (error) {
      console.error('Error obteniendo datos:', error.message);
      alert('Hubo un error obteniendo los datos. Consulte la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Importar Calles por Departamento</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="País"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Departamento"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={fetchData} style={{ padding: '5px 10px' }}>
          {loading ? 'Cargando...' : 'Importar'}
        </button>
      </div>

      {resultados.length > 0 ? (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre de la Calle</th>
              <th>Old Name</th>
              <th>Localidad</th>
              <th>Barrio</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((street, index) => (
              <tr key={index}>
                <td>{street.name}</td>
                <td>{street.old_name}</td>
                <td>{street.localidad}</td>
                <td>{street.barrio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No se encontraron resultados.</p>
      )}
    </div>
  );
};

export default ImportForm;
