"use client";

import { useRouter, useSearchParams } from "next/navigation";
import WebSocketClient from "../components/WebSocketClient";
import { useEffect, useState, useRef } from "react";

const Page = () => {
  const router = useRouter();
  const sessionIdRef = useRef<string | null>(null); // Referencia para almacenar el sessionId
  const socketRef = useRef<WebSocket | null>(null); // Referencia para el WebSocket

  // Conexión al WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // Cambiar a tu URL de WebSocket

    ws.onopen = () => {
      console.log("WebSocket conectado");

      // Enviar un mensaje inicial para identificar el tipo de cliente
      const initialMessage = {
        clientType: "map",
      };
      ws.send(JSON.stringify(initialMessage));
      console.log("Mensaje inicial enviado:", initialMessage);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido del servidor:", data);

        // Si el mensaje contiene un sessionId, almacenarlo en la referencia
        if (data.sessionId) {
          sessionIdRef.current = data.sessionId;
          console.log(
            "Session ID almacenado en la referencia:",
            sessionIdRef.current,
          );
        }
      } catch (error) {
        console.error("Error procesando mensaje del servidor:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Error en el WebSocket:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket desconectado");
    };

    socketRef.current = ws; // Asignar el WebSocket a la referencia

    return () => {
      ws.close(); // Cerrar el WebSocket al desmontar el componente
    };
  }, []);

  // Función para enviar mensajes al WebSocket
  const sendMessageToWebSocket = (data: Record<string, any>) => {
    const sessionId = sessionIdRef.current; // Obtener el sessionId de la referencia

    if (!sessionId) {
      console.warn(
        "El sessionId no está disponible, no se puede enviar el mensaje",
      );
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        const payload = {
          ...data,
          sessionId, // Incluir el sessionId en el mensaje
          clientType: "map", // Incluir el tipo de cliente
        };
        socketRef.current.send(JSON.stringify(payload));
        console.log("Mensaje enviado al WebSocket:", payload);
      } catch (error) {
        console.error("Error al enviar mensaje al WebSocket:", error);
      }
    } else {
      console.warn("El WebSocket no está conectado");
    }
  };

  // Función para manejar la actualización de ubicación desde el componente de mapa
  const handleLocationChange = (
    newLocation: Record<string, string>,
    coordinates: [number, number],
  ) => {
    const updatedLocation = {
      pais: newLocation.pais || "Uruguay",
      departamento: newLocation.departamento || "Montevideo",
      ciudad: newLocation.ciudad || "Ciudad Vieja",
      calle: newLocation.calle || "18 de Julio",
      numero: newLocation.numero || "1234",
    };

    // Enviar los datos al WebSocket
    const message = {
      ...updatedLocation,
      coordinates: {
        latitude: coordinates[1],
        longitude: coordinates[0],
      },
    };
    sendMessageToWebSocket(message); // Llamar a la función que envía al WebSocket
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Colocar el componente WebSocket debajo del mapa */}
      <WebSocketClient />
    </div>
  );
};

export default Page;
