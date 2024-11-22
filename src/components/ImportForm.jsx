'use client';

import { useState } from 'react';
import * as turf from '@turf/turf'; // Importar Turf.js

const ImportForm = () => {
  const [pais, setPais] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Polígonos de localidades y barrios (pre-cargados, se deben obtener previamente)
  const areaPolygons = {
    localidades: [], // Ejemplo: [{ name: "Montevideo", geometry: { ... } }]
    barrios: [], // Ejemplo: [{ name: "Cordón", geometry: { ... } }]
  };

  const fetchData = async () => {
    if (!pais || !departamento) {
      alert('Por favor, complete ambos campos: País y Departamento.');
      return;
    }

    setLoading(true);

    try {
      console.log('Obteniendo calles del departamento desde Overpass...');

      // Consulta 1: Obtener todas las calles del departamento
      const overpassQuery = `
        [out:json];
        area["name"="${departamento}"]["admin_level"="4"]->.searchArea;
        (
          way["highway"]["name"](area.searchArea);
        );
        out tags;
      `;
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

      // Normalizar calles eliminando duplicados
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
        console.log(`Procesando geometría para la calle: ${street.name}`);

        // Consulta 2: Obtener geometría de la calle
        const geometryQuery = `
          [out:json];
          area["name"="${departamento}"]["admin_level"="8"]->.searchArea;
          way["name"="${street.name}"](area.searchArea);
          out geom;
        `;

        const geometryResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: geometryQuery,
        });

        if (!geometryResponse.ok) {
          console.warn(`Error obteniendo geometría para ${street.name}`);
          enrichedStreets.push({ ...street, localidad: 'Error', barrio: 'Error' });
          continue;
        }

        const geometryData = await geometryResponse.json();
        console.log(`Geometría obtenida para ${street.name}:`, geometryData);

        const points = geometryData.elements.flatMap((way) =>
          way.geometry.map(({ lat, lon }) => turf.point([lon, lat]))
        );

        // Usar Turf.js para determinar localidades y barrios
        const localidades = new Set();
        const barrios = new Set();

        points.forEach((point) => {
          // Verificar localidades
          areaPolygons.localidades.forEach((localidad) => {
            const polygon = turf.polygon(localidad.geometry.coordinates);
            if (turf.booleanPointInPolygon(point, polygon)) {
              localidades.add(localidad.name);
            }
          });

          // Verificar barrios
          areaPolygons.barrios.forEach((barrio) => {
            const polygon = turf.polygon(barrio.geometry.coordinates);
            if (turf.booleanPointInPolygon(point, polygon)) {
              barrios.add(barrio.name);
            }
          });
        });

        console.log(`Localidades para ${street.name}:`, Array.from(localidades));
        console.log(`Barrios para ${street.name}:`, Array.from(barrios));

        enrichedStreets.push({
          ...street,
          localidad: Array.from(localidades).join(', ') || 'Desconocido',
          barrio: Array.from(barrios).join(', ') || 'Desconocido',
        });
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
