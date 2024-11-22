'use client';

import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import StreetRenderer from './StreetRenderer';
import { fromLonLat } from 'ol/proj';

const MapContainer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null); // Instancia del mapa
  const [addressParams, setAddressParams] = useState(null); // Parámetros de la dirección
  const searchParams = useSearchParams(); // Maneja los parámetros de la URL

  // Inicializa el mapa
  useEffect(() => {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Error: El contenedor del mapa (#map) no se encontró en el DOM.');
      return;
    }

    if (!map) {
      console.log('Inicializando el mapa...');
      const newMap = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([0, 0]), // Coordenadas iniciales
          zoom: 2,
        }),
      });
      setMap(newMap);
      console.log('Mapa inicializado correctamente.');
    }
  }, [map]);

  // Leer parámetros de la URL
  useEffect(() => {
    const params = {
      pais: searchParams.get('pais'),
      departamento: searchParams.get('departamento'),
      calle: searchParams.get('calle'),
      numero: searchParams.get('numero'),
      esquina: searchParams.get('esquina'),
    };

    console.log('Parámetros obtenidos de la URL:', params);
    if (params.pais || params.departamento || params.calle || params.numero || params.esquina) {
      setAddressParams(params);
    }
  }, [searchParams]);

  // Centrarse en la ubicación según los parámetros
  useEffect(() => {
    if (!map || !addressParams) {
      console.warn('Mapa no inicializado o sin parámetros de dirección.');
      return;
    }

    const fetchCoordinates = async () => {
      const { pais, departamento, calle, numero, esquina } = addressParams;

      // Construir la consulta dinámica
      let query = '';
      if (calle) query += `${calle}`;
      if (numero) query += ` ${numero}`;
      if (esquina) query += ` y ${esquina}`;
      if (departamento) query += `, ${departamento}`;
      if (pais) query += `, ${pais}`;

      if (!query.trim()) {
        console.warn('No hay parámetros válidos para buscar una ubicación.');
        return;
      }

      console.log('Consulta para Nominatim:', query);

      const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

      try {
        console.log('Realizando petición a Nominatim...');
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Error en la respuesta de Nominatim: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Respuesta de Nominatim:', data);

        if (data.length > 0) {
          const { lat, lon } = data[0];
          console.log('Coordenadas obtenidas:', { lat, lon });

          // Centrar el mapa en las coordenadas
          map.getView().setCenter(fromLonLat([parseFloat(lon), parseFloat(lat)]));
          map.getView().setZoom(15);
          console.log('Mapa centrado en la ubicación.');
        } else {
          console.warn('No se encontraron resultados para la ubicación proporcionada.');
        }
      } catch (error) {
        console.error('Error al obtener coordenadas de Nominatim:', error.message);
      }
    };

    fetchCoordinates();
  }, [map, addressParams]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div id="map" style={{ width: '100%', height: '100%', position: 'absolute' }} ref={mapRef} />

      {/* Renderizar calles si solo hay departamento y calle */}
      {map && addressParams?.calle && addressParams?.departamento && (
        <StreetRenderer map={map} params={addressParams} />
      )}
    </div>
  );
};

export default MapContainer;
