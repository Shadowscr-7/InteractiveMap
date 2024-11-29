"use client";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import { Tooltip, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LayersIcon from "@mui/icons-material/Layers";

const OpenLayersMap = ({
  pais,
  departamento,
  ciudad,
  calle,
  numero,
  onLocationChange,
}) => {
  const mapRef = useRef(null);
  const markerSource = useRef(new VectorSource());
  const [coordinates, setCoordinates] = useState(null);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  // Crear una referencia para la capa de mapa
  const layerRef = useRef(new TileLayer({ source: new OSM() }));

  // Función para determinar el nivel de zoom en función de los parámetros disponibles
  const getZoomLevel = () => {
    if (numero) return 18; // Zoom muy cercano para número de puerta
    if (calle) return 16; // Zoom cercano para calle
    if (ciudad) return 13; // Zoom medio para ciudad
    if (departamento) return 10; // Zoom alejado para departamento
    return 5; // Zoom lejano para país
  };

  // Geolocalización inicial basada en los parámetros
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!pais && !departamento && !ciudad && !calle && !numero) {
        console.warn(
          "No se proporcionaron suficientes datos para geolocalizar.",
        );
        return;
      }

      const address = `${numero ? `${numero} ` : ""}${calle ? `${calle}, ` : ""}${ciudad || ""}, ${departamento || ""}, ${pais || ""}`;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        );
        const data = await response.json();

        if (data.length > 0) {
          const { lat, lon } = data[0];
          const coords = [parseFloat(lon), parseFloat(lat)];
          setCoordinates(coords);
          if (numero) addMarker(coords); // Solo muestra marcador si hay número de puerta
          if (mapRef.current) {
            mapRef.current.getView().setCenter(fromLonLat(coords));
            mapRef.current.getView().setZoom(getZoomLevel());
          }
        } else {
          console.warn(
            "No se encontraron coordenadas para la dirección proporcionada.",
          );
        }
      } catch (error) {
        console.error("Error al obtener coordenadas:", error);
      }
    };

    fetchCoordinates();
  }, [pais, departamento, ciudad, calle, numero]);

  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (!mapRef.current) {
      // Crear el mapa con una única capa
      mapRef.current = new Map({
        target: "map",
        layers: [layerRef.current],
        view: new View({
          center: coordinates
            ? fromLonLat(coordinates)
            : fromLonLat([-56.1645, -34.9011]),
          zoom: getZoomLevel(),
        }),
      });

      // Añadir la capa de marcador
      const markerLayer = new VectorLayer({
        source: markerSource.current,
      });
      mapRef.current.addLayer(markerLayer);

      // Evento de clic para actualizar el marcador y la ubicación
      mapRef.current.on("click", async (event) => {
        const coords = toLonLat(event.coordinate);
        setCoordinates(coords);
        addMarker(coords);

        // Búsqueda inversa de dirección
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords[1]}&lon=${coords[0]}&format=json`,
          );
          const data = await response.json();

          if (data && data.address) {
            const newLocation = {
              pais: data.address.country || "",
              departamento: data.address.state || "",
              ciudad: data.address.city || data.address.town || "",
              calle: data.address.road || "",
              numero: data.address.house_number || "",
            };

            onLocationChange(newLocation, coords);
          } else {
            console.warn("No se pudo realizar la búsqueda inversa.");
          }
        } catch (error) {
          console.error("Error en la búsqueda inversa:", error);
        }
      });
    }
  }, [coordinates, onLocationChange]);

  // Añadir un marcador en el mapa
  const addMarker = (coords) => {
    markerSource.current.clear();
    const marker = new Feature({
      geometry: new Point(fromLonLat(coords)),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          src: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scale: 1,
        }),
      }),
    );

    markerSource.current.addFeature(marker);
  };

  // Alternar la vista satelital y normal cambiando la fuente de la capa
  const toggleMapView = () => {
    setIsSatelliteView(!isSatelliteView);

    layerRef.current.setSource(
      isSatelliteView
        ? new OSM() // Volver a la vista normal
        : new XYZ({
            url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
          }), // Cambiar a vista satelital
    );
  };

  // Centrar el mapa en las coordenadas actuales
  const handleCenterMap = () => {
    if (coordinates) {
      mapRef.current.getView().setCenter(fromLonLat(coordinates));
      mapRef.current.getView().setZoom(getZoomLevel());
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "500px" }}>
      <div
        id="map"
        style={{ width: "100%", height: "100%", cursor: "crosshair" }}
      />

      {/* Controles en el mapa */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Tooltip title="Centrar">
          <IconButton
            onClick={handleCenterMap}
            style={{ backgroundColor: "white", width: "40px", height: "40px" }}
          >
            <MyLocationIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cambiar Vista">
          <IconButton
            onClick={toggleMapView}
            style={{ backgroundColor: "white", width: "40px", height: "40px" }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default OpenLayersMap;
