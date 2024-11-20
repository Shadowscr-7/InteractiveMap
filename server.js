// server.js
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // UUID para generar IDs únicos
const wss = new WebSocket.Server({ port: 8080 });

// Mapa para almacenar clientes y sus sesiones
const sessions = new Map();

wss.on('connection', (ws) => {
  // Genera un ID de sesión único para el cliente
  const sessionId = uuidv4();
  ws.sessionId = sessionId;

  console.log(`New client connected with session ID: ${sessionId}`);

  // Almacena el cliente en la sesión correspondiente
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { mapClient: null, panelClient: null });
  }

  // Enviar el `sessionId` al cliente para que lo use en la identificación futura
  const welcomeMessage = { message: 'Welcome to WebSocket server!', sessionId };
  ws.send(JSON.stringify(welcomeMessage));
  console.log(`Sent to client [sessionId: ${sessionId}]:`, welcomeMessage);

  // Escuchar mensajes de clientes
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received from client [sessionId: ${sessionId}]:`, data);

      // Verifica si el cliente está identificándose como mapa o panel y almacena en la sesión
      if (data.clientType === 'map') {
        sessions.get(sessionId).mapClient = ws;
        console.log(`Session ${sessionId}: Map client connected`);
      } else if (data.clientType === 'panel') {
        sessions.get(sessionId).panelClient = ws;
        console.log(`Session ${sessionId}: Panel client connected`);
      }

      // Empareja los clientes si ambos están conectados
      const session = sessions.get(sessionId);
      if (session.mapClient && session.panelClient) {
        console.log(`Session ${sessionId} is now paired with a map and panel client`);

        // Verificar si los clientes están abiertos antes de enviar mensajes de emparejamiento
        const pairMessageToMap = { message: 'Paired with panel client', sessionId };
        const pairMessageToPanel = { message: 'Paired with map client', sessionId };

        if (session.mapClient.readyState === WebSocket.OPEN) {
          session.mapClient.send(JSON.stringify(pairMessageToMap));
          console.log(`Sent to map client [sessionId: ${sessionId}]:`, pairMessageToMap);
        }
        if (session.panelClient.readyState === WebSocket.OPEN) {
          session.panelClient.send(JSON.stringify(pairMessageToPanel));
          console.log(`Sent to panel client [sessionId: ${sessionId}]:`, pairMessageToPanel);
        }
      }
    } catch (error) {
      console.error(`Error processing message for session ${sessionId}:`, error);
    }
  });

  // Maneja la desconexión del cliente con un temporizador antes de eliminar la sesión
  ws.on('close', () => {
    console.log(`Client disconnected from session ${sessionId}`);

    // Espera 30 segundos antes de eliminar la sesión, en caso de reconexión
    setTimeout(() => {
      const session = sessions.get(sessionId);

      // Solo elimina la sesión si ambos clientes están desconectados
      if (session && (!session.mapClient || session.mapClient.readyState === WebSocket.CLOSED) &&
          (!session.panelClient || session.panelClient.readyState === WebSocket.CLOSED)) {
        sessions.delete(sessionId);
        console.log(`Session ${sessionId} has been deleted after both clients disconnected`);
      }
    }, 30000); // 30 segundos de espera
  });
});
