// src/components/ZonesMap.js
"use client";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Modify from "ol/interaction/Modify";
import TooltipInfo from "@/components/TooltipInfo";

const ZonesMap = ({ zones }) => {
  const mapRef = useRef(null);
  const zoneSource = useRef(new VectorSource());
  const [hoveredZone, setHoveredZone] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Inicializar el mapa
  useEffect(() => {
    if (!mapRef.current) {
      const initialMap = new Map({
        target: "map",
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

      // Añadir la interacción de modificación para hacer los puntos arrastrables
      const modify = new Modify({ source: zoneSource.current });
      initialMap.addInteraction(modify);

      // Evento para mostrar información al pasar sobre una zona
      initialMap.on("pointermove", (event) => {
        mapRef.current.getTargetElement().style.cursor = ""; // Resetear el cursor por defecto

        // Obtener la zona bajo el puntero
        const feature = mapRef.current.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature,
        );
        if (feature) {
          const zoneData = feature.get("data");
          setHoveredZone(zoneData);
          setTooltipPosition({
            x: event.pixel[0] + 15,
            y: event.pixel[1] - 15,
          });
          mapRef.current.getTargetElement().style.cursor = "pointer";
        } else {
          setHoveredZone(null); // Quitar la información si no hay zona bajo el puntero
        }
      });

      // Escuchar el evento de modificación para actualizar las coordenadas de la zona en tiempo real
      modify.on("modifyend", (event) => {
        event.features.forEach((feature) => {
          const modifiedCoords = feature.getGeometry().getCoordinates();
          const zoneData = feature.get("data");
          console.log("Zona modificada:", zoneData.nombre, modifiedCoords);
          // Aquí puedes guardar las nuevas coordenadas en el estado o en un backend, si es necesario.
        });
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
        }),
      );

      polygon.set("data", zone);
      zoneSource.current.addFeature(polygon);
    });
  }, [zones]);

  return (
    <div style={{ position: "relative", width: "100%", height: "500px" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />

      {hoveredZone && (
        <TooltipInfo
          data={{
            nombre: hoveredZone.nombre,
            "Moviles Activos": hoveredZone.movilesActivos,
            "Pedidos Pendientes": hoveredZone.pedidosPendientes,
          }}
          position={tooltipPosition}
          title="Información de Zona"
        />
      )}
    </div>
  );
};

export default ZonesMap;
