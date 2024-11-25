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
  const streetSource = useRef(new VectorSource());
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastCoordinates, setLastCoordinates] = useState([-56.1645, -34.9011]); // Montevideo por defecto

  useEffect(() => {
    console.log('Initializing map...');
    if (!mapRef.current) {
      const baseLayer = new TileLayer({
        source: new OSM(),
      });

      mapRef.current = new Map({
        target: 'map',
        layers: [
          baseLayer,
          new VectorLayer({
            source: streetSource.current,
          }),
        ],
        view: new View({
          center: fromLonLat(lastCoordinates),
          zoom: 5,
        }),
      });

      setIsMapReady(true);
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  // Centrado del mapa
  const handleCenterMap = () => {
    if (mapRef.current && lastCoordinates) {
      mapRef.current.getView().setCenter(fromLonLat(lastCoordinates));
      mapRef.current.getView().setZoom(15); // Zoom predeterminado para puntos cercanos
    }
  };

  return (
    <div id="map-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Contenedor del mapa */}
      <div id="map" style={{ width: '100%', height: '100%' }} />

      {/* Botón de centrado */}
      {isMapReady && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 1000,
          }}
        >
          <div
            onClick={handleCenterMap}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}
          >
            {/* Ícono de puntería */}
            <img
              src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23007bff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-crosshair'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='22' y1='12' x2='18' y2='12'%3E%3C/line%3E%3Cline x1='6' y1='12' x2='2' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='6' x2='12' y2='2'%3E%3C/line%3E%3Cline x1='12' y1='22' x2='12' y2='18'%3E%3C/line%3E%3C/svg%3E"
              alt="Center Icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
      )}

      {/* Indicador de carga */}
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

      {/* Mensaje de error */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Pasar parámetros a los hijos */}
      {isMapReady &&
        children &&
        React.Children.map(children, (child) =>
          React.cloneElement(child, {
            map: mapRef.current,
            streetSource: streetSource.current,
            isMapReady,
            setIsLoading,
            setErrorMessage,
            setLastCoordinates,
            params: { pais, departamento, ciudad, calle, numero, esquina },
          })
        )}
    </div>
  );
};

export default MapCompleto;
