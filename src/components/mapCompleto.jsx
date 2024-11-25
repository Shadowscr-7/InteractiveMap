'use client';

import React, { useState } from 'react';
import 'ol/ol.css';
import { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';

const MapCompleto = ({ pais, departamento, ciudad, calle, numero, esquina, children }) => {
  const mapRef = useRef(null);
  const streetSource = useRef(new VectorSource()); // Fuente compartida para calles
  const [isMapReady, setIsMapReady] = useState(false); // Nuevo estado para indicar si el mapa está listo
  const [isLoading, setIsLoading] = useState(true); // Estado general de carga (incluye hijos)

  useEffect(() => {
    console.log('Initializing map...');
    if (!mapRef.current) {
      // Crear el mapa
      mapRef.current = new Map({
        target: 'map', // ID del contenedor
        layers: [
          new TileLayer({ source: new OSM() }),
          new VectorLayer({
            source: streetSource.current, // Fuente para las calles
          }),
        ],
        view: new View({
          center: fromLonLat([-56.1645, -34.9011]), // Coordenadas iniciales en Montevideo
          zoom: 5,
        }),
      });

      // Marcar el mapa como listo
      setIsMapReady(true);

      // Simular un retraso adicional para cargar elementos
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  return (
    <div id="map-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Contenedor del mapa siempre visible */}
      <div id="map" style={{ width: '100%', height: '100%' }} />

      {/* Indicador de carga sobre el mapa */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '6px solid #ddd',
              borderTop: '6px solid #007bff',
              borderRadius: '50%',
              animation: 'spinner 1s linear infinite',
            }}
          ></div>
          <p style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>Cargando ubicación...</p>
        </div>
      )}

      {/* Pasar el mapa, la fuente y el estado de inicialización a los hijos */}
      {isMapReady &&
        children &&
        React.Children.map(children, (child) =>
          React.cloneElement(child, {
            map: mapRef.current,
            streetSource: streetSource.current,
            isMapReady,
            setIsLoading, // Pasar control de carga a los hijos
            params: { pais, departamento, ciudad, calle, numero, esquina }, // Pasar todos los parámetros
          })
        )}
    </div>
  );
};

export default MapCompleto;
