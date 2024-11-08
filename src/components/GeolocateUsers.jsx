'use client';

import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';

const OpenLayersMap = ({ personas }) => {
  const mapRef = useRef(null);
  const markerSource = useRef(new VectorSource());
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Crear y configurar el mapa
  useEffect(() => {
    if (!mapRef.current) {
      const initialMap = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([-56.1645, -34.9011]), // Centro inicial
          zoom: 12,
        }),
      });

      const markerLayer = new VectorLayer({
        source: markerSource.current,
      });
      initialMap.addLayer(markerLayer);

      // Añadir evento de clic en el mapa para mostrar información del marcador
      initialMap.on('click', (event) => {
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
          const personaData = feature.get('data');
          setSelectedPersona(personaData);
          return true; // Detener la iteración después de encontrar el primer marcador
        });
      });

      mapRef.current = initialMap;
    }
  }, []);

  // Actualizar marcadores cuando cambian los datos de personas
  useEffect(() => {
    markerSource.current.clear();

    personas.forEach((persona) => {
      const marker = new Feature({
        geometry: new Point(fromLonLat([persona.coord_x, persona.coord_y])),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            src: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scale: 1,
          }),
        })
      );

      marker.set('data', persona);
      markerSource.current.addFeature(marker);
    });
  }, [personas]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />

      {selectedPersona && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h4>Información de Persona</h4>
          <p><strong>Nombre:</strong> {selectedPersona.nombre}</p>
          <p><strong>Device ID:</strong> {selectedPersona.device_id}</p>
          <p><strong>Movil ID:</strong> {selectedPersona.movil_id}</p>
        </div>
      )}
    </div>
  );
};

export default OpenLayersMap;
