import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { sampleRouter } from "./routes/sample";
import { gameRouter } from "./routes/game";
import { logger } from "hono/logger";
import { websocketHandler } from "./websocket";

const app = new Hono();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecodeapp\.com$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

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
