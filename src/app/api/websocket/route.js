// src/app/api/websocket/route.js
import { WebSocketServer } from "ws";

let socketServer;

export async function GET(req) {
  if (!socketServer) {
    // Crear el servidor WebSocket
    socketServer = new WebSocketServer({ port: 8080 });

    // Configurar eventos
    socketServer.on("connection", (socket) => {
      console.log("Cliente conectado al WebSocket");

      socket.on("message", (message) => {
        console.log("Mensaje recibido del cliente:", message);

        // Enviar respuesta al cliente
        socket.send(`Servidor recibió: ${message}`);
      });

      socket.on("close", () => {
        console.log("Cliente desconectado");
      });
    });

    console.log("Servidor WebSocket iniciado en ws://172.16.1.83:8080");
  }

  return new Response("WebSocket Server is running", { status: 200 });
}
