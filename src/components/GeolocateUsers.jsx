"use client";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

const GeolocateUsers = ({ personas }) => {
  const mapRef = useRef(null);
  const markerSource = useRef(new VectorSource());
  const [hoveredPersona, setHoveredPersona] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Crear y configurar el mapa
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
          center: fromLonLat([-56.1645, -34.9011]), // Centro inicial
          zoom: 15, // Nivel de zoom inicial
        }),
      });

      const markerLayer = new VectorLayer({
        source: markerSource.current,
      });
      initialMap.addLayer(markerLayer);

      // Añadir evento de pointermove para manejar los tooltips
      initialMap.on("pointermove", (event) => {
        mapRef.current.getTargetElement().style.cursor = ""; // Resetear el cursor por defecto

        const feature = mapRef.current.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature,
        );
        if (feature) {
          const personaData = feature.get("data"); // Obtener datos de la persona
          setHoveredPersona(personaData);

          // Posicionar el cuadro justo encima del marcador
          setTooltipPosition({
            x: event.pixel[0] + 15, // Ajuste horizontal
            y: event.pixel[1] - 15, // Ajuste vertical
          });

          console.log("Feature encontrada bajo el puntero:", personaData);

          mapRef.current.getTargetElement().style.cursor = "pointer"; // Cambiar cursor
        } else {
          console.log(
            "No hay feature bajo el puntero en posición:",
            event.pixel,
          );
          setHoveredPersona(null); // Limpiar tooltip si no hay feature
        }
      });

      mapRef.current = initialMap;
    }
  }, []);

  // Actualizar marcadores cuando cambian los datos de personas
  useEffect(() => {
    markerSource.current.clear();

    console.log("Datos recibidos en GeolocateUsers:", personas);

    if (!personas || personas.length === 0) {
      console.warn("El array de personas está vacío o no está definido.");
      return;
    }

    personas.forEach((persona, index) => {
      const { MovId, latitude, longitude } = persona;
      console.log("Procesando persona:", persona);

      // Validar coordenadas
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        console.warn(`Coordenadas inválidas para MovId: ${MovId}`);
        return;
      }

      // Desplazamiento para evitar solapamientos
      const offset = 0.0001 * (index % 2 === 0 ? 1 : -1);

      const marker = new Feature({
        geometry: new Point(
          fromLonLat([longitude + offset, latitude + offset]),
        ),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            src: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scale: 1.5, // Incrementar escala para mejor visibilidad
          }),
        }),
      );

      marker.set("data", { MovId, latitude, longitude });
      markerSource.current.addFeature(marker);
      console.log("Marcador añadido para MovId:", MovId);
    });

    console.log(
      "Número de marcadores en la fuente:",
      markerSource.current.getFeatures().length,
    );
  }, [personas]);

  return (
    <div style={{ position: "relative", width: "100%", height: "500px" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />

      {hoveredPersona && (
        <div
          style={{
            position: "absolute",
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid black",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          <h4>Información de Persona</h4>
          <p>
            <strong>Movil ID:</strong> {hoveredPersona.MovId}
          </p>
          <p>
            <strong>Latitud:</strong> {hoveredPersona.latitude.toFixed(6)}
          </p>
          <p>
            <strong>Longitud:</strong> {hoveredPersona.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default GeolocateUsers;
