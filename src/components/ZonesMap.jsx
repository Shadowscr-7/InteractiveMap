// src/components/ZonesMap.js
'use client';

import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import TooltipInfo from '@/components/TooltipInfo';

const ZonesMap = ({ zones }) => {
  const mapRef = useRef(null);
  const zoneSource = useRef(new VectorSource());
  const [hoveredZone, setHoveredZone] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Inicializar el mapa
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
          center: fromLonLat([-56.1645, -34.9011]),
          zoom: 13,
        }),
      });

      const zoneLayer = new VectorLayer({
        source: zoneSource.current,
      });
      initialMap.addLayer(zoneLayer);

      // Evento para mostrar información al pasar sobre una zona
      initialMap.on('pointermove', (event) => {
        mapRef.current.getTargetElement().style.cursor = ''; // Resetear el cursor por defecto

        // Obtener la zona bajo el puntero
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        if (feature) {
          const zoneData = feature.get('data');
          setHoveredZone(zoneData);
          setTooltipPosition({
            x: event.pixel[0] + 15,
            y: event.pixel[1] - 15,
          });
          mapRef.current.getTargetElement().style.cursor = 'pointer';
        } else {
          setHoveredZone(null); // Quitar la información si no hay zona bajo el puntero
        }
      });

      mapRef.current = initialMap;
    }
  }, []);

  // Dibujar zonas en el mapa
  useEffect(() => {
    zoneSource.current.clear();

    zones.forEach((zone) => {
      const coordinates = zone.coord.map((coord) => fromLonLat(coord));
      const polygon = new Feature({
        geometry: new Polygon([coordinates]),
      });

      polygon.setStyle(
        new Style({
          fill: new Fill({
            color: zone.color,
          }),
        })
      );

      polygon.set('data', zone);
      zoneSource.current.addFeature(polygon);
    });
  }, [zones]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />

      {hoveredZone && (
        <><TooltipInfo
            data={{
                nombre: hoveredZone.nombre,
                'Moviles Activos': hoveredZone.movilesActivos,
                'Pedidos Pendientes': hoveredZone.pedidosPendientes,
            }}
            position={tooltipPosition}
            title="Información de Zona" />
                  
        <h4>{hoveredZone.nombre}</h4>
        <p><strong>Moviles Activos:</strong> {hoveredZone.movilesActivos}</p>
        <p><strong>Pedidos Pendientes:</strong> {hoveredZone.pedidosPendientes}</p></>
      )}
    </div>
  );
};

export default ZonesMap;
