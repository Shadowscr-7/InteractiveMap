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
import TooltipInfo from '@/components/TooltipInfo';

const GeolocateUsers = ({ personas }) => {
  const mapRef = useRef(null);
  const markerSource = useRef(new VectorSource());
  const [hoveredPersona, setHoveredPersona] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

      // Añadir evento de pointermove en el mapa para mostrar información del marcador
      initialMap.on('pointermove', (event) => {
        mapRef.current.getTargetElement().style.cursor = ''; // Resetear el cursor por defecto

        // Obtener la feature bajo el puntero
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        if (feature) {
          const personaData = feature.get('data');
          setHoveredPersona(personaData);

          // Posicionar el cuadro justo encima y ligeramente a la derecha del marcador
          setTooltipPosition({
            x: event.pixel[0] + 15, // Un poco a la derecha del marcador
            y: event.pixel[1] - 15, // Un poco arriba del marcador
          });
          
          mapRef.current.getTargetElement().style.cursor = 'pointer'; // Cambiar el cursor cuando se pasa sobre un marcador
        } else {
          setHoveredPersona(null); // Quitar la información si no hay feature bajo el puntero
        }
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

      {hoveredPersona && (
        <><TooltipInfo
          data={{
            nombre: hoveredPersona.nombre,
            'Device ID': hoveredPersona.device_id,
            'Movil ID': hoveredPersona.movil_id,
          }}
          position={tooltipPosition}
          title="Información de Persona" />
          
          <h4>Información de Persona</h4>
          <p><strong>Nombre:</strong> {hoveredPersona.nombre}</p>
          <p><strong>Device ID:</strong> {hoveredPersona.device_id}</p>
          <p><strong>Movil ID:</strong> {hoveredPersona.movil_id}</p>
        </>
      )}
    </div>
  );
};

export default GeolocateUsers;
