import type { ServerWebSocket } from "bun";

export interface WSData {
  sessionId: string;
  playerId: string;
  playerName: string;
}

export interface GameClient {
  ws: ServerWebSocket<WSData>;
  sessionId: string;
  playerId: string;
  playerName: string;
}

// Map of sessionId -> array of connected clients
export const sessionClients = new Map<string, GameClient[]>();

export function addClient(client: GameClient): void {
  const clients = sessionClients.get(client.sessionId) || [];
  clients.push(client);
  sessionClients.set(client.sessionId, clients);
}

export function removeClient(sessionId: string, playerId: string): void {
  const clients = sessionClients.get(sessionId) || [];
  const filtered = clients.filter((c) => c.playerId !== playerId);
  if (filtered.length === 0) {
    sessionClients.delete(sessionId);
  } else {
    sessionClients.set(sessionId, filtered);
  }
}

export function broadcastToSession(
  sessionId: string,
  message: object,
  excludePlayerId?: string
): void {
  const clients = sessionClients.get(sessionId) || [];
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (excludePlayerId && client.playerId === excludePlayerId) continue;
    try {
      client.ws.send(data);
    } catch (_e) {
      // Client disconnected, ignore
    }
  }
}

export function broadcastToAll(sessionId: string, message: object): void {
  broadcastToSession(sessionId, message);
}
