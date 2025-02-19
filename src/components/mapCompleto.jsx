"use client";

import React, { useState, useRef, useEffect } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import { fetchPOIs, createPOI } from "../services/services";
import { defaults as defaultControls } from "ol/control";

const MapCompleto = ({ params, children, onParamsUpdate }) => {
  const mapRef = useRef(null);
  const streetSource = useRef(new VectorSource());
  const poiLayers = useRef({}); // Almacena capas para cada tipo de POI
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastCoordinates, setLastCoordinates] = useState([-56.1645, -34.9011]); // Montevideo por defecto
  const [selectedPOIs, setSelectedPOIs] = useState([]);
  const markerSource = useRef(new VectorSource()); // Fuente para los marcadores de clic
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para el popup
  const [inputValue, setInputValue] = useState(""); // Estado para el cuadro de texto
  const [isPopupButtonActive, setIsPopupButtonActive] = useState(false); //Estado del boton popup
  const popupButtonRef = useRef(isPopupButtonActive); // Crear la referencia

  const markerLayer = useRef(
    new VectorLayer({
      source: markerSource.current,
    }),
  );
  // Accede a los parámetros desde params
  console.log('PARAMETROS DE MAP', params);
  // Desestructurar los valores del objeto params
  // Verificación previa de las propiedades
// Verificación previa de las propiedades
const {
  pais,
  departamento: departamentoObjRaw,
  ciudad: ciudadObjRaw,
  calle: calleObjRaw,
  numero,
  esquina: esquinaObjRaw
} = params;

// Ajustar las propiedades dinámicamente y manejar valores faltantes
const departamento = typeof departamentoObjRaw === "object" ? departamentoObjRaw?.nombre ?? "" : departamentoObjRaw ?? "";
const ciudad = typeof ciudadObjRaw === "object" ? ciudadObjRaw?.CalleNombre ?? "" : ciudadObjRaw ?? "";
const calle = typeof calleObjRaw === "object" ? calleObjRaw?.nombre ?? "" : calleObjRaw ?? "";
const esquina = typeof esquinaObjRaw === "object" ? esquinaObjRaw?.nombre ?? "" : esquinaObjRaw ?? "";

// Resultado final
console.log({
  pais: pais ?? "",
  departamento,
  ciudad,
  calle,
  numero: numero ?? "", // Asegurar que numero no sea undefined
  esquina
});

  const [showPOIControls, setShowPOIControls] = useState(false); // Estado para controlar la visibilidad de los botones

  // Log para verificar los parámetros
  /*console.log("Parámetros iniciales:", {
    pais,
    departamento,
    ciudad,
    calle,
    numero,
    esquina,
  });*/

  // Configuración de íconos de POI
  const POI_TYPES = {
    H: { tooltip: "Hospital", icon: "/icons/hospital.png" },
    E: { tooltip: "Educación", icon: "/icons/library.png" },
    P: { tooltip: "Edificio Público", icon: "/icons/public.png" },
    B: { tooltip: "Banco", icon: "/icons/bank.png" },
    O: { tooltip: "RioGas", icon: "/icons/circle.png" }, // Genérico
    F: { tooltip: "Farmacia", icon: "/icons/pharmacy.png" },
  };

  const handleMapClick = async (event) => {
    try {
      setIsLoading(true); // Mostrar el loading al inicio

      if (popupButtonRef.current) {
        openPopup(); // Abre el popup
      } else {
        console.log("No abrir");
      }

      if (!mapRef.current) return;

      const coordinate = toLonLat(event.coordinate);
      console.log("Clicked coordinates:", coordinate);

      const [lon, lat] = coordinate;
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

      const fetchNearbyStreets = async (lat, lon, roadName) => {
        const overpassQuery = `
          [out:json];
          node(around:50,${lat},${lon})["highway"];
          way(bn)["highway"];
          out body;
        `;

        try {
          const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
              method: "POST",
              body: overpassQuery,
              headers: { "Content-Type": "text/plain" },
            },
          );
          if (!response.ok) throw new Error("Error fetching Overpass data.");
          const overpassData = await response.json();
          const ways = overpassData.elements;

          // Filtrar calles para encontrar intersecciones
          const mainStreet = ways.find(
            (way) => way.tags && way.tags.name === roadName,
          );
          if (!mainStreet) {
            console.warn("Main street not found in Overpass data.");
            return [];
          }

          const mainStreetNodes = new Set(mainStreet.nodes);
          const intersectingStreets = ways.filter((way) => {
            if (!way.tags || !way.tags.name || way.tags.name === roadName)
              return false;
            return way.nodes.some((node) => mainStreetNodes.has(node));
          });

          return intersectingStreets.map((way) => way.tags.name);
        } catch (error) {
          console.error("Error fetching nearby streets:", error);
          return [];
        }
      };

      try {
        // Geocodificación inversa con Nominatim
        const response = await fetch(nominatimUrl);
        if (!response.ok)
          throw new Error("Error fetching reverse geocoding data.");

        const data = await response.json();
        console.log("Reverse geocoding result:", data);

        const { address } = data;

        // Actualiza los parámetros con la nueva dirección
        const updatedParams = {
          pais: address?.country || "",
          departamento: address?.state || "",
          ciudad: address?.city || address?.town || address?.village || "",
          calle: address?.road || "",
          numero: address?.house_number || "",
          esquina: "",
        };

        console.log("Updated parameters:", updatedParams);

        // Consulta adicional a Overpass para las esquinas
        if (updatedParams.calle) {
          const nearbyStreets = await fetchNearbyStreets(
            lat,
            lon,
            updatedParams.calle,
          );
          if (nearbyStreets.length > 0) {
            console.log("Esquinas encontradas:", nearbyStreets);
            updatedParams.esquina = nearbyStreets[0];
          } else {
            console.log("No se encontraron esquinas cercanas.");
          }
        }

        console.log("Final updated parameters:", updatedParams);

        // Elimina los puntos del mapa que correspondan a la dirección anterior
        markerSource.current.clear(); // Limpia todos los marcadores previos
        console.log("Cleared previous markers.");

        // Añade marcador en la ubicación clickeada
        const marker = new Feature({
          geometry: new Point(fromLonLat([lon, lat])),
        });
        marker.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src:
                "data:image/svg+xml;charset=utf-8," +
                encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              `),
              scale: 1,
            }),
          }),
        );

        markerSource.current.addFeature(marker);
        console.log("Added marker to markerSource:", marker);

        // Centrar el mapa en el lugar del clic
        mapRef.current.getView().setCenter(fromLonLat([lon, lat]));
        mapRef.current.getView().setZoom(15);
        console.log("Map centered on marker.");

        // Llama al callback con los parámetros actualizados
        if (onParamsUpdate) {
          onParamsUpdate(updatedParams);
        }
      } catch (error) {
        console.error(
          "Error in reverse geocoding or fetching nearby streets:",
          error,
        );
      }
    } catch (error) {
      console.error("Error en handleMapClick:", error);
    } finally {
      setIsLoading(false); // Ocultar el loading al final
    }
  };

  // Añade marcadores para un tipo de POI
  const addPOIMarkers = (pois, poiType) => {
    console.log(`Adding POI markers for type: ${poiType}`, pois);

    if (!poiLayers.current[poiType]) {
      poiLayers.current[poiType] = new VectorLayer({
        source: new VectorSource(),
      });
      mapRef.current.addLayer(poiLayers.current[poiType]);
    }

    const layer = poiLayers.current[poiType];
    const source = layer.getSource();
    source.clear(); // Limpia los marcadores existentes del tipo seleccionado
    console.log(`Cleared existing markers for type: ${poiType}`);

    pois.forEach((poi) => {
      const { PuntosReferenciaLatitud, PuntosReferenciaLongitud } = poi;
      const coordinates = fromLonLat([
        parseFloat(PuntosReferenciaLongitud),
        parseFloat(PuntosReferenciaLatitud),
      ]);

      console.log(`Adding marker at coordinates:`, coordinates);

      const feature = new Feature({
        geometry: new Point(coordinates),
        data: poi,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: POI_TYPES[poiType]?.icon || "/icons/circle.png",
            scale: 0.05,
            anchor: [0.5, 1],
          }),
        }),
      );

      source.addFeature(feature);
    });
    console.log(`Markers added for type: ${poiType}`);
  };

  const handlePOISelection = async (poiKey) => {
    console.log(`Handling POI selection for key: ${poiKey}`);

    const isSelected = selectedPOIs.includes(poiKey);
    console.log(`Is POI already selected? ${isSelected}`);

    const updatedPOIs = isSelected
      ? selectedPOIs.filter((key) => key !== poiKey)
      : [...selectedPOIs, poiKey];

    console.log(`Updated POI selection:`, updatedPOIs);

    setSelectedPOIs(updatedPOIs);

    // Eliminar capa si se deselecciona
    if (!updatedPOIs.includes(poiKey) && poiLayers.current[poiKey]) {
      console.log(`Removing layer for POI type: ${poiKey}`);
      mapRef.current.removeLayer(poiLayers.current[poiKey]);
      delete poiLayers.current[poiKey];
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching POIs for type: ${poiKey}`);

      // Llamada al servicio
      const pois = await fetchPOIs({
        departamento,
        ciudad,
        POIs: [poiKey],
      });

      console.log(`Response Fetched POIs for type: ${poiKey}`, pois);

      addPOIMarkers(pois, poiKey);
    } catch (error) {
      console.error("Error al obtener POIs:", error);
      setErrorMessage("Error al obtener POIs");
    } finally {
      setIsLoading(false);
      console.log(`Finished handling POI selection for key: ${poiKey}`);
    }
  };

  const showPOIInfo = (mapEvent) => {
    const tooltipElement = document.getElementById("poi-tooltip");
    if (!tooltipElement) {
      console.error("Tooltip element not found in DOM");
      return;
    }

    const feature = mapEvent.map.getFeaturesAtPixel(mapEvent.pixel)[0];

    if (feature) {
      const data = feature.get("data");
      if (data) {
        const mapContainer = document.getElementById("map"); // Contenedor del mapa
        const rect = mapContainer.getBoundingClientRect(); // Obtener las coordenadas del contenedor del mapa

        tooltipElement.style.visibility = "visible";
        tooltipElement.style.left = `${mapEvent.originalEvent.clientX - rect.left + 15}px`; // Ajustar posición horizontal
        tooltipElement.style.top = `${mapEvent.originalEvent.clientY - rect.top + 15}px`; // Ajustar posición vertical
        tooltipElement.innerHTML = `
        <strong>${data.PuntosReferenciaNombre}</strong><br>
        ${data.PuntosReferenciaCalle || ""} ${
          data.PuntosReferenciaNumero ? `#${data.PuntosReferenciaNumero}` : ""
        }<br>
        ${data.PuntosReferenciaEsquina ? `Esquina: ${data.PuntosReferenciaEsquina}` : ""}
      `;
      }
    } else {
      tooltipElement.style.visibility = "hidden";
    }
  };

  useEffect(() => {
      const getCookie = (name) => {
        const matches = document.cookie.match(
          new RegExp("(?:^|; )" + name + "=([^;]*)")
        );
        return matches ? decodeURIComponent(matches[1]) : null;
      };
    
      const usuario = getCookie("Usuario");
      console.log("Valor de la cookie Usuario:", usuario);
    }, []);

  useEffect(() => {
    setIsLoading(true); // Mostrar el loading al inicio
    const fetchCoordinates = async () => {
      if (departamento || ciudad) {
        const query = `${ciudad || ""}, ${departamento || ""}, ${pais || ""}`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Error fetching coordinates.");
          const data = await response.json();

          if (data.length > 0) {
            const { lon, lat } = data[0];
            const newCoordinates = [parseFloat(lon), parseFloat(lat)];
            console.log(`Fetched coordinates for ${query}: [${lon}, ${lat}]`);
            setLastCoordinates(newCoordinates);

            // Centrar el mapa inmediatamente después de actualizar coordenadas
            if (mapRef.current) {
              mapRef.current.getView().setCenter(fromLonLat(newCoordinates));
              mapRef.current.getView().setZoom(15);
            }
          } else {
            console.warn(`No coordinates found for ${query}`);
          }
        } catch (error) {
          console.error("Error fetching coordinates:", error);
        }
      }
    };

    fetchCoordinates();
    setIsLoading(false); // Mostrar el loading al inicio
  }, [departamento, ciudad, pais]); // Escucha cambios en `departamento`, `ciudad` o `pais`

  useEffect(() => {
    popupButtonRef.current = isPopupButtonActive;
  }, [isPopupButtonActive]);

  useEffect(() => {
    if (!mapRef.current) {
      // Inicialización del mapa si no existe
      const baseLayer = new TileLayer({
        source: new OSM(),
      });

      mapRef.current = new Map({
        target: "map",
        layers: [
          baseLayer,
          new VectorLayer({
            source: streetSource.current,
          }),
          markerLayer.current, // Agregar explícitamente la capa de marcadores al mapa
        ],
        view: new View({
          center: fromLonLat(lastCoordinates),
          zoom: 5,
        }),
        controls: defaultControls({ zoom: false }), // Desactiva los botones de zoom
      });

      // Eventos del mapa
      setIsLoading(true);
      mapRef.current.on("pointermove", showPOIInfo);
      mapRef.current.on("click", handleMapClick);
      setIsMapReady(true);
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      // Detectar cambios en parámetros y limpiar contenido del mapa

      // 1. Limpiar marcadores
      console.log("Limpiando marcadores por cambio de parámetros");
      markerSource.current.clear(); // Limpia todos los marcadores existentes

      // 2. Limpiar capas de calles
      console.log("Limpiando capas de calles por cambio de parámetros");
      streetSource.current.clear(); // Limpia todas las calles dibujadas

      // 3. Limpiar capas de POIs
      Object.keys(poiLayers.current).forEach((poiKey) => {
        const layer = poiLayers.current[poiKey];
        if (layer) {
          console.log(`Limpiando capa de POIs para tipo: ${poiKey}`);
          const source = layer.getSource();
          source.clear(); // Limpia los puntos de interés de esa capa
          mapRef.current.removeLayer(layer); // Elimina la capa del mapa
          delete poiLayers.current[poiKey]; // Borra la referencia de la capa
        }
      });

      console.log("Mapa limpiado debido a cambios en los parámetros.");
      console.log("Parámetros cambiados: ", {
        pais,
        departamento,
        ciudad,
        calle,
        numero,
        esquina,
      });
    }
  }, [pais, departamento, ciudad, calle, numero, esquina]); // Dependencias

  const handleCenterMap = () => {
    if (mapRef.current && lastCoordinates) {
      mapRef.current.getView().setCenter(fromLonLat(lastCoordinates));
      mapRef.current.getView().setZoom(15);
    }
  };

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => {
    setIsPopupOpen(false);
    setInputValue(""); // Limpiar el cuadro de texto al cerrar
  };

  const confirmAction = async () => {
    console.log("Texto ingresado:", inputValue);
  
    // Datos para crear el POI (ajústalos según tu lógica de datos)
    const poiData = {
      Departamento: departamento, // Puedes cambiarlo dinámicamente
      Ciudadd: ciudad,
      PuntosReferenciaCalle: calle, // Ejemplo
      PuntosReferenciaNumero: numero,
      PuntosReferenciaLatitud: lat,
      PuntosReferenciaLongitud: lon,
      PuntosReferenciaNombre: inputValue, // Nombre ingresado en el input
      PuntosReferenciaUsuIns: usuario, // Ajusta según corresponda
    };
  
    try {
      const response = await createPOI(poiData);
      console.log("Respuesta del servidor:", response);
      alert("Punto de interés creado exitosamente.");
    } catch (error) {
      console.error("Error al confirmar acción:", error);
      alert("Error al crear el punto de interés. Intenta nuevamente.");
    }
  
    setIsPopupOpen(false);
    setInputValue(""); // Limpiar después de confirmar
  };

  return (
    <div
      id="map-container"
      style={{
        position: "relative",
        width: "100%",
        height: "360px",
      }}
    >
      <div id="map" style={{ width: "100%", height: "100%" }} />

      {/* Tooltip */}
      <div
        id="poi-tooltip"
        style={{
          position: "absolute",
          backgroundColor: "#fff",
          padding: "5px 10px",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          color: "black",
          pointerEvents: "none",
          zIndex: 1000,
          visibility: "hidden",
        }}
      ></div>

      {/* Botón de centrado */}
      {isMapReady && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={handleCenterMap}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
              cursor: "pointer",
            }}
          >
            <img
              src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23007bff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-crosshair'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='22' y1='12' x2='18' y2='12'%3E%3C/line%3E%3Cline x1='6' y1='12' x2='2' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='6' x2='12' y2='2'%3E%3C/line%3E%3Cline x1='12' y1='22' x2='12' y2='18'%3E%3C/line%3E%3C/svg%3E"
              alt="Center Icon"
              style={{ width: "20px", height: "20px" }}
            />
          </div>
          {/* Botón de abrir popup */}
          <div
            onClick={() => setIsPopupButtonActive((prev) => !prev)} // Cambia el estado
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: isPopupButtonActive ? "#dc3545" : "#007bff", // Verde si está activo
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
            }}
          >
            <span style={{ fontSize: "18px" }}>✍️</span>
          </div>
          ;
        </div>
      )}

      {/* Botón para POI Controls */}
      {isMapReady && (
        <div
          style={{
            position: "absolute",
            top: "120px",
            right: "10px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={() => setShowPOIControls(!showPOIControls)}
            style={{
              position: "relative",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#007bff",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
            }}
          >
            {showPOIControls ? "▲" : "▼"}
          </div>
        </div>
      )}

      {isMapReady && showPOIControls && (
        <div
          style={{
            position: "absolute",
            top: "180px",
            right: "10px",
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            zIndex: 1000,
          }}
        >
          {Object.entries(POI_TYPES).map(([key, { tooltip, icon }]) => (
            <div
              key={key}
              onClick={() => handlePOISelection(key)}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: selectedPOIs.includes(key) ? "#aaa" : "#fff",
                color: "#000",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
              }}
              title={tooltip}
            >
              <img
                src={icon}
                alt={tooltip}
                style={{ width: "25px", height: "25px" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Popup */}
      {isPopupOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            animation: "fadeIn 0.3s ease", // Animación de entrada
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transform: "translateY(0)",
              animation: "slideUp 0.3s ease", // Animación de deslizamiento
            }}
          >
            <h3 style={{ margin: 0 }}>Escribe algo</h3>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe aquí..."
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={confirmAction}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Confirmar
              </button>
              <button
                onClick={closePopup}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Otros elementos */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "6px solid #ddd",
              borderTop: "6px solid #007bff",
              borderRadius: "50%",
              animation: "spinner 1s linear infinite",
            }}
          ></div>
          <p
            style={{ marginTop: "10px", fontSize: "16px", fontWeight: "bold" }}
          >
            Cargando ubicación...
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          <p>{errorMessage}</p>
        </div>
      )}

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
            onParamsUpdate: onParamsUpdate,
          }),
        )}
    </div>
  );
};

export default MapCompleto;
