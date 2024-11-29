/*'use client';

import { useEffect, useState } from 'react';

const WebSocketClient = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); // Conexión al servidor WebSocket local

    ws.onopen = () => {
      console.log('Conexión establecida con el WebSocket');
      ws.send('Hola desde el cliente React');
    };

    ws.onmessage = (event) => {
      console.log('Mensaje recibido del servidor:', event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error('Error en el WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };

    setSocket(ws);

    // Cerrar el WebSocket al desmontar el componente
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = 'Mensaje desde React';
      socket.send(message);
      console.log('Mensaje enviado:', message);
    } else {
      console.warn('El WebSocket no está conectado');
    }
  };

  return (
    <div>
      <h3>Mensajes del WebSocket:</h3>
      <button onClick={sendMessage}>Enviar mensaje</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketClient;
*/
"use client";

import { useEffect, useState } from "react";

const WebSocketClient = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null); // Para almacenar el sessionId recibido del servidor

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // Conexión al servidor WebSocket

    ws.onopen = () => {
      console.log("Conexión establecida con el WebSocket");

      // Envía un mensaje inicial indicando que este cliente es un "map"
      const initialMessage = JSON.stringify({ clientType: "map" });
      ws.send(initialMessage);
      console.log("Mensaje inicial enviado:", initialMessage);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido del servidor:", data);

        // Almacena el sessionId si el mensaje lo contiene
        if (data.sessionId) {
          setSessionId(data.sessionId);
          console.log("Session ID recibido:", data.sessionId);
        }

        setMessages((prev) => [...prev, JSON.stringify(data)]);
      } catch (error) {
        console.error("Error al procesar el mensaje recibido:", error);
        setMessages((prev) => [...prev, event.data]); // Guarda el mensaje sin procesar
      }
    };

    ws.onerror = (error) => {
      console.error("Error en el WebSocket:", error);
    };

    ws.onclose = () => {
      console.log("Conexión WebSocket cerrada");
    };

    setSocket(ws);

    // Cerrar el WebSocket al desmontar el componente
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        clientType: "map",
        content: "Mensaje desde React",
        sessionId, // Incluye el sessionId si está disponible
      });
      socket.send(message);
      console.log("Mensaje enviado:", message);
    } else {
      console.warn("El WebSocket no está conectado");
    }
  };

  return (
    <div>
      <h3>Mensajes del WebSocket:</h3>
      <button onClick={sendMessage}>Enviar mensaje</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      {sessionId && (
        <p>
          <strong>Session ID:</strong> {sessionId}
        </p>
      )}
    </div>
  );
};

export default WebSocketClient;
