import type { ServerWebSocket } from "bun";
import { addClient, removeClient, broadcastToAll } from "./gameState";

interface WSData {
  sessionId: string;
  playerId: string;
  playerName: string;
}

export const websocketHandler = {
  open(ws: ServerWebSocket<WSData>): void {
    const { sessionId, playerId, playerName } = ws.data;
    addClient({ ws, sessionId, playerId, playerName });
    console.log(`[WS] Player ${playerName} connected to session ${sessionId}`);

    // Notify others in the room
    broadcastToAll(sessionId, {
      type: "player_connected",
      playerId,
      playerName,
    });
  },

  message(ws: ServerWebSocket<WSData>, message: string | Buffer): void {
    // REST handles game actions; WS is primarily for server-to-client broadcasts
    try {
      const data = JSON.parse(message.toString()) as { type?: string };
      console.log(`[WS] Message from ${ws.data.playerName}:`, data.type);
    } catch (_e) {
      // Ignore parse errors
    }
  },

  close(ws: ServerWebSocket<WSData>): void {
    const { sessionId, playerId, playerName } = ws.data;
    removeClient(sessionId, playerId);
    console.log(`[WS] Player ${playerName} disconnected from session ${sessionId}`);

    broadcastToAll(sessionId, {
      type: "player_disconnected",
      playerId,
      playerName,
    });
  },
};
