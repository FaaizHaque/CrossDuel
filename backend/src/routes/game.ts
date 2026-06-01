import { Hono } from "hono";
import { prisma } from "../prisma";
import { DEFAULT_PUZZLE } from "../puzzleData";
import { broadcastToAll } from "../gameState";

export const gameRouter = new Hono();

// Scoring constants
const WORD_BASE_SCORE = 100;
const SPEED_BONUS_MAX = 50;
const ACCURACY_PENALTY = 25;
const TOTAL_WORDS = Object.keys(DEFAULT_PUZZLE.answers).length;

function calculateSpeedBonus(startedAt: Date | null, completedAt: Date): number {
  if (!startedAt) return 0;
  const elapsedMs = completedAt.getTime() - startedAt.getTime();
  const elapsedSeconds = elapsedMs / 1000;
  // Full bonus for first 30s, linear decay to 0 at 300s
  if (elapsedSeconds <= 30) return SPEED_BONUS_MAX;
  if (elapsedSeconds >= 300) return 0;
  return Math.floor(SPEED_BONUS_MAX * (1 - (elapsedSeconds - 30) / 270));
}

// POST /api/game/create
gameRouter.post("/create", async (c) => {
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const playerName = (body.playerName as string) || "Player 1";
  const playerId = (body.playerId as string) || crypto.randomUUID();

  // Ensure default puzzle exists
  let puzzle = await prisma.puzzle.findFirst();
  if (!puzzle) {
    puzzle = await prisma.puzzle.create({
      data: {
        title: DEFAULT_PUZZLE.title,
        answers: JSON.stringify(DEFAULT_PUZZLE.answers),
        clues: JSON.stringify(DEFAULT_PUZZLE.clues),
      },
    });
  }

  const session = await prisma.gameSession.create({
    data: {
      puzzleId: puzzle.id,
      status: "waiting",
      player1Id: playerId,
      player1Name: playerName,
    },
  });

  return c.json({
    data: {
      sessionId: session.id,
      playerId,
      playerNumber: 1,
      clues: DEFAULT_PUZZLE.clues,
      status: session.status,
    },
  });
});

// POST /api/game/join/:sessionId
gameRouter.post("/join/:sessionId", async (c) => {
  const { sessionId } = c.req.param();
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const playerName = (body.playerName as string) || "Player 2";
  const playerId = (body.playerId as string) || crypto.randomUUID();

  // Support both full CUID and 8-char prefix codes
  let session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session && sessionId.length <= 8) {
    session = await prisma.gameSession.findFirst({
      where: { id: { startsWith: sessionId.toLowerCase() }, status: "waiting" },
    });
  }
  if (!session) return c.json({ error: { message: "Session not found" } }, 404);
  if (session.status !== "waiting")
    return c.json({ error: { message: "Game already started or finished" } }, 400);
  if (session.player1Id === playerId)
    return c.json({ error: { message: "Already in this game" } }, 400);

  const startedAt = new Date();
  const updated = await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      player2Id: playerId,
      player2Name: playerName,
      status: "active",
      startedAt,
    },
  });

  // Broadcast to player 1 that game started
  broadcastToAll(sessionId, {
    type: "game_started",
    sessionId,
    player1Name: updated.player1Name,
    player2Name: updated.player2Name,
    startedAt: startedAt.toISOString(),
  });

  return c.json({
    data: {
      sessionId: session.id,
      playerId,
      playerNumber: 2,
      clues: DEFAULT_PUZZLE.clues,
      status: "active",
      player1Name: updated.player1Name,
      player2Name: updated.player2Name,
      startedAt: startedAt.toISOString(),
    },
  });
});

// GET /api/game/:sessionId
gameRouter.get("/:sessionId", async (c) => {
  const { sessionId } = c.req.param();
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session) return c.json({ error: { message: "Session not found" } }, 404);

  return c.json({
    data: {
      sessionId: session.id,
      status: session.status,
      player1Id: session.player1Id,
      player1Name: session.player1Name,
      player1Score: session.player1Score,
      player1Words: JSON.parse(session.player1Words) as string[],
      player1Errors: session.player1Errors,
      player2Id: session.player2Id,
      player2Name: session.player2Name,
      player2Score: session.player2Score,
      player2Words: JSON.parse(session.player2Words) as string[],
      player2Errors: session.player2Errors,
      winnerId: session.winnerId,
      startedAt: session.startedAt?.toISOString() ?? null,
      finishedAt: session.finishedAt?.toISOString() ?? null,
      totalWords: TOTAL_WORDS,
    },
  });
});

// POST /api/game/:sessionId/word
gameRouter.post("/:sessionId/word", async (c) => {
  const { sessionId } = c.req.param();
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const playerId = body.playerId as string | undefined;
  const wordKey = body.wordKey as string | undefined;
  const answer = body.answer as string | undefined;

  if (!playerId || !wordKey || !answer) {
    return c.json({ error: { message: "Missing playerId, wordKey, or answer" } }, 400);
  }

  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session) return c.json({ error: { message: "Session not found" } }, 404);
  if (session.status !== "active")
    return c.json({ error: { message: "Game is not active" } }, 400);

  const isPlayer1 = session.player1Id === playerId;
  const isPlayer2 = session.player2Id === playerId;
  if (!isPlayer1 && !isPlayer2)
    return c.json({ error: { message: "Not a player in this game" } }, 403);

  // Validate answer
  const correctAnswer = DEFAULT_PUZZLE.answers[wordKey];
  if (!correctAnswer) return c.json({ error: { message: "Unknown word key" } }, 400);

  const isCorrect = answer.trim().toUpperCase() === correctAnswer.toUpperCase();
  const now = new Date();

  const playerWords: string[] = JSON.parse(
    isPlayer1 ? session.player1Words : session.player2Words
  );
  const alreadyCompleted = playerWords.includes(wordKey);

  if (alreadyCompleted) {
    return c.json({
      data: { correct: false, alreadyCompleted: true, message: "Word already completed" },
    });
  }

  if (!isCorrect) {
    // Apply accuracy penalty
    const updateData = isPlayer1
      ? {
          player1Errors: session.player1Errors + 1,
          player1Score: Math.max(0, session.player1Score - ACCURACY_PENALTY),
        }
      : {
          player2Errors: session.player2Errors + 1,
          player2Score: Math.max(0, session.player2Score - ACCURACY_PENALTY),
        };

    await prisma.gameSession.update({ where: { id: sessionId }, data: updateData });

    broadcastToAll(sessionId, {
      type: "word_incorrect",
      playerId,
      wordKey,
      playerName: isPlayer1 ? session.player1Name : session.player2Name,
      penalty: ACCURACY_PENALTY,
    });

    return c.json({
      data: { correct: false, message: "Incorrect answer", penalty: ACCURACY_PENALTY },
    });
  }

  // Correct answer
  const speedBonus = calculateSpeedBonus(session.startedAt, now);
  const wordScore = WORD_BASE_SCORE + speedBonus;
  const newWords = [...playerWords, wordKey];

  const updateData = isPlayer1
    ? {
        player1Words: JSON.stringify(newWords),
        player1Score: session.player1Score + wordScore,
      }
    : {
        player2Words: JSON.stringify(newWords),
        player2Score: session.player2Score + wordScore,
      };

  // Check if game is over (all words completed by either player)
  const p1Words: string[] = JSON.parse(isPlayer1 ? JSON.stringify(newWords) : session.player1Words);
  const p2Words: string[] = JSON.parse(isPlayer1 ? session.player2Words : JSON.stringify(newWords));

  const allWordsComplete = p1Words.length + p2Words.length >= TOTAL_WORDS;
  const playerCompletedAll = newWords.length >= TOTAL_WORDS;

  if (playerCompletedAll || allWordsComplete) {
    // Game over
    const finalUpdateData = {
      ...updateData,
      status: "finished",
      finishedAt: now,
    };

    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: finalUpdateData,
    });

    // Calculate winner
    const p1FinalScore = isPlayer1 ? updatedSession.player1Score : session.player1Score;
    const p2FinalScore = isPlayer2 ? updatedSession.player2Score : session.player2Score;
    const winnerId =
      p1FinalScore >= p2FinalScore ? session.player1Id : session.player2Id;

    await prisma.gameSession.update({ where: { id: sessionId }, data: { winnerId } });

    broadcastToAll(sessionId, {
      type: "game_over",
      sessionId,
      winnerId,
      player1Score: p1FinalScore,
      player2Score: p2FinalScore,
      player1Name: session.player1Name,
      player2Name: session.player2Name,
    });

    return c.json({
      data: {
        correct: true,
        wordScore,
        speedBonus,
        wordKey,
        gameOver: true,
        winnerId,
      },
    });
  }

  await prisma.gameSession.update({ where: { id: sessionId }, data: updateData });

  broadcastToAll(sessionId, {
    type: "word_completed",
    playerId,
    wordKey,
    playerName: isPlayer1 ? session.player1Name : session.player2Name,
    wordScore,
    speedBonus,
    totalScore: isPlayer1
      ? session.player1Score + wordScore
      : session.player2Score + wordScore,
  });

  return c.json({
    data: {
      correct: true,
      wordScore,
      speedBonus,
      wordKey,
      gameOver: false,
    },
  });
});

// GET /api/game/:sessionId/results
gameRouter.get("/:sessionId/results", async (c) => {
  const { sessionId } = c.req.param();
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session) return c.json({ error: { message: "Session not found" } }, 404);

  return c.json({
    data: {
      sessionId: session.id,
      status: session.status,
      player1Name: session.player1Name,
      player1Score: session.player1Score,
      player1Words: JSON.parse(session.player1Words) as string[],
      player1Errors: session.player1Errors,
      player2Name: session.player2Name,
      player2Score: session.player2Score,
      player2Words: JSON.parse(session.player2Words) as string[],
      player2Errors: session.player2Errors,
      winnerId: session.winnerId,
      startedAt: session.startedAt?.toISOString() ?? null,
      finishedAt: session.finishedAt?.toISOString() ?? null,
      totalWords: TOTAL_WORDS,
    },
  });
});
