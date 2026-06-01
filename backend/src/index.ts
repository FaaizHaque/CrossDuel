import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { sampleRouter } from "./routes/sample";
import { gameRouter } from "./routes/game";
import { logger } from "hono/logger";
import { websocketHandler } from "./websocket";
import { prisma } from "./prisma";
import { DEFAULT_PUZZLE } from "./puzzleData";

const app = new Hono();

// CORS middleware - allow all origins for local development
app.use("*", cors({ origin: "*", credentials: false }));

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Seed / sync the default puzzle on startup
async function seedPuzzle(): Promise<void> {
  const answersJson = JSON.stringify(DEFAULT_PUZZLE.answers);
  const cluesJson = JSON.stringify(DEFAULT_PUZZLE.clues);
  const existing = await prisma.puzzle.findFirst();
  if (!existing) {
    await prisma.puzzle.create({
      data: { title: DEFAULT_PUZZLE.title, answers: answersJson, clues: cluesJson },
    });
    console.log("[seed] Default puzzle created with", Object.keys(DEFAULT_PUZZLE.answers).length, "words");
  } else if (existing.answers !== answersJson || existing.clues !== cluesJson) {
    await prisma.puzzle.update({
      where: { id: existing.id },
      data: { title: DEFAULT_PUZZLE.title, answers: answersJson, clues: cluesJson },
    });
    console.log("[seed] Default puzzle updated with", Object.keys(DEFAULT_PUZZLE.answers).length, "words");
  }
}

seedPuzzle().catch((err) => console.error("[seed] Failed to seed puzzle:", err));

// Routes
app.route("/api/sample", sampleRouter);
app.route("/api/game", gameRouter);

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch(req: Request, server: { upgrade: (req: Request, opts: { data: { sessionId: string; playerId: string; playerName: string } }) => boolean }) {
    // Handle WebSocket upgrades for game sessions
    const url = new URL(req.url);
    if (url.pathname.startsWith("/ws/game/")) {
      const parts = url.pathname.split("/");
      // Path: /ws/game/:sessionId
      const sessionId = parts[3] || "";
      const playerId =
        url.searchParams.get("playerId") || crypto.randomUUID();
      const playerName = decodeURIComponent(
        url.searchParams.get("playerName") || "Player"
      );

      const success = server.upgrade(req, {
        data: { sessionId, playerId, playerName },
      });
      if (success) return undefined as unknown as Response;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return app.fetch(req);
  },
  websocket: websocketHandler,
};
