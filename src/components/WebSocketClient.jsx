'use client';

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
