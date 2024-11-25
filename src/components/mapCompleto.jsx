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

const MapCompleto = ({ pais, departamento, calle, children }) => {
  const mapRef = useRef(null);
  const streetSource = useRef(new VectorSource()); // Fuente compartida para calles
  const [isMapReady, setIsMapReady] = useState(false); // Nuevo estado para indicar si el mapa está listo

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
    }
  }, []);

  return (
    <div id="map-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Contenedor del mapa siempre visible */}
      <div id="map" style={{ width: '100%', height: '100%' }} />

      {/* Indicador de carga sobre el mapa */}
      {!isMapReady && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <p>Loading map...</p>
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
          })
        )}
    </div>
  );
};

export default MapCompleto;
