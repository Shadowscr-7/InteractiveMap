const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // UUID para generar IDs únicos
const wss = new WebSocket.Server({ port: 8080 });

// Mapa para almacenar sesiones y su estado
const sessions = new Map();

// Variable para almacenar el ID de sesión actual
let currentSessionId = null;

wss.on('connection', (ws) => {
  console.log(`New client connected`);

  // Si no hay una sesión activa para emparejar, genera un nuevo UUID
  if (!currentSessionId || !sessions.has(currentSessionId) || (sessions.get(currentSessionId).mapClient && sessions.get(currentSessionId).panelClient)) {
    currentSessionId = uuidv4();
    sessions.set(currentSessionId, { mapClient: null, panelClient: null });
    console.log(`New session created with ID: ${currentSessionId}`);
  }

  // Almacena el cliente en la sesión activa, según su tipo
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received from client:`, data);

      // Verifica si el mensaje incluye un `sessionId`
      const sessionId = data.sessionId || currentSessionId;

      // Verifica si la sesión existe en el mapa
      const session = sessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found for client.`);
        return;
      }

      // Identifica el tipo de cliente y lo almacena en la sesión actual
      if (data.clientType === 'map') {
        session.mapClient = ws;
        console.log(`Session ${sessionId}: Map client connected`);
      } else if (data.clientType === 'panel') {
        session.panelClient = ws;
        console.log(`Session ${sessionId}: Panel client connected`);
      }

      // Reenvía los mensajes entre clientes si ambos están conectados
      if (session.mapClient && session.panelClient) {
        if (data.clientType === 'map') {
          if (session.panelClient.readyState === WebSocket.OPEN) {
            console.log(`Reenviando mensaje del map al panel en sesión ${sessionId}`);
            session.panelClient.send(JSON.stringify(data));
            console.log(`Mensaje reenviado al panel:`, data);
          } else {
            console.warn(`Panel en sesión ${sessionId} no está listo para recibir mensajes`);
          }
        } else if (data.clientType === 'panel') {
          if (session.mapClient.readyState === WebSocket.OPEN) {
            console.log(`Reenviando mensaje del panel al map en sesión ${sessionId}`);
            session.mapClient.send(JSON.stringify(data));
            console.log(`Mensaje reenviado al map:`, data);
          } else {
            console.warn(`Map en sesión ${sessionId} no está listo para recibir mensajes`);
          }
        }
      } else {
        console.log(`No se puede reenviar mensaje en sesión ${sessionId}: uno de los clientes no está conectado.`);
      }

      // Empareja los clientes si ambos están conectados
      if (session.mapClient && session.panelClient && !session.paired) {
        console.log(`Session ${sessionId} is now paired with a map and panel client`);
        session.paired = true;

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

        // Prepara un nuevo `currentSessionId` para la próxima conexión
        currentSessionId = null;
      }
    } catch (error) {
      console.error(`Error processing message:`, error);
    }
  });

  // Enviar el `sessionId` al cliente para que lo use en la identificación futura
  const welcomeMessage = { message: 'Welcome to WebSocket server!', sessionId: currentSessionId };
  ws.send(JSON.stringify(welcomeMessage));
  console.log(`Sent to client [sessionId: ${currentSessionId}]:`, welcomeMessage);

  // Maneja la desconexión del cliente
  ws.on('close', () => {
    console.log(`Client disconnected from session ${currentSessionId}`);
    const session = sessions.get(currentSessionId);

    // Maneja la desconexión del cliente y limpia si es necesario
    if (session) {
      if (session.mapClient === ws) {
        session.mapClient = null;
        console.log(`Map client disconnected from session ${currentSessionId}`);
      }
      if (session.panelClient === ws) {
        session.panelClient = null;
        console.log(`Panel client disconnected from session ${currentSessionId}`);
      }

      // Elimina la sesión si ambos clientes están desconectados
      if (!session.mapClient && !session.panelClient) {
        sessions.delete(currentSessionId);
        console.log(`Session ${currentSessionId} has been deleted after both clients disconnected`);
      }
    }
  });
});
