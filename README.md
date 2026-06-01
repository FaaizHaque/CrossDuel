# Cross Duel

A real-time 1v1 competitive crossword game built with Expo React Native and a Hono/Bun backend.

## Architecture

```
workspace/
  mobile/    — Expo SDK 53 app (port 8081)
  backend/   — Hono + Bun + Prisma API (port 3000)
```

## Features

### Real-Time 1v1 Game
- Two players join the same match room via a shareable 8-character game code
- Both players receive an identical 9×9 crossword board with 15 ACROSS words
- Backend validates each word submission before marking it correct
- WebSocket broadcasts sync game state between both players instantly

### Scoring System
- **Base score**: 100 pts per correct word
- **Speed bonus**: Up to 50 pts for fast completions (full bonus under 30s, decays to 0 at 300s)
- **Accuracy penalty**: -25 pts per incorrect submission
- Winner is determined by total score when all words are completed

### Screens
1. **Duels Tab** (`/two`) — Lobby/matchmaking: create or join a duel, share game code
2. **Game Screen** (`/game`) — Live multiplayer crossword with opponent score bar, real-time word feedback
3. **Results Screen** (`/results`) — Winner reveal with score comparison and word stats

## Backend API

All routes return `{ data: T }` envelope (except errors which return `{ error: { message } }`).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/game/create` | Create a new game session |
| POST | `/api/game/join/:sessionId` | Join as player 2 (accepts full ID or 8-char prefix) |
| GET | `/api/game/:sessionId` | Get current game state |
| POST | `/api/game/:sessionId/word` | Submit a word answer for validation |
| GET | `/api/game/:sessionId/results` | Get final game results |

### WebSocket
Connect to `wss://{BACKEND_HOST}/ws/game/:sessionId?playerId=...&playerName=...`

Events received:
- `game_started` — Both players connected, game is live
- `word_completed` — A player completed a word (includes score)
- `word_incorrect` — A player submitted a wrong answer (includes penalty)
- `game_over` — Game finished (includes winner and final scores)
- `player_connected` / `player_disconnected` — Connection status changes

## Database Schema (SQLite via Prisma)

- **Puzzle** — Stores crossword answers and clues as JSON
- **GameSession** — Tracks two players, scores, completed words, errors, and game status

## Puzzle Layout

The default puzzle (`Cross Duel #1`) uses a 9×9 grid with 15 ACROSS words:
`EPIC, BOLD, APEX, GLOW, IRON, ZONE, TRIUMPH, MASTERS, ECLIPSE, GAME, DUEL, FIRE, WORD, ACED, STAR`
