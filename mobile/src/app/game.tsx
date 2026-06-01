import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '@/lib/state/gameStore';
import { api } from '@/lib/api/api';
import CrosswordGrid from '@/components/CrosswordGrid';
import { puzzles } from '@/puzzles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WordSubmitResponse {
  correct: boolean;
  score: number;
}

const COLORS = {
  bg: '#0A0A0A',
  card: '#111111',
  accent: '#F5E642',
  textPrimary: '#F5F5F0',
  textMuted: '#555555',
  textSecondary: '#888888',
  error: '#FF4444',
  success: '#4CAF50',
  blue: '#3B82F6',
  cardBorder: '#1E1E1E',
};

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  // Store selectors
  const sessionId = useGameStore((s) => s.sessionId);
  const playerId = useGameStore((s) => s.playerId);
  const playerNumber = useGameStore((s) => s.playerNumber);
  const playerName = useGameStore((s) => s.playerName);
  const opponentName = useGameStore((s) => s.opponentName);
  const storeClues = useGameStore((s) => s.clues);
  const myScore = useGameStore((s) => s.myScore);
  const opponentScore = useGameStore((s) => s.opponentScore);
  const myWords = useGameStore((s) => s.myWords);
  const opponentWords = useGameStore((s) => s.opponentWords);

  // Store actions
  const addMyWord = useGameStore((s) => s.addMyWord);
  const addOpponentWord = useGameStore((s) => s.addOpponentWord);
  const addOpponentError = useGameStore((s) => s.addOpponentError);
  const updateMyScore = useGameStore((s) => s.updateMyScore);
  const updateOpponentScore = useGameStore((s) => s.updateOpponentScore);
  const setWinner = useGameStore((s) => s.setWinner);
  const setGame = useGameStore((s) => s.setGame);

  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState<boolean>(false);
  const [flashError, setFlashError] = useState<boolean>(false);

  // Build clue strings for CrosswordGrid (key → clue text)
  const puzzle = puzzles[0];
  // Merge server clues (from store) with local puzzle clues
  const gridClues: Record<string, string> = { ...puzzle.clues, ...storeClues };

  // completed word keys for CrosswordGrid (string[])
  const completedWordKeys: string[] = myWords.map((idx) => {
    const allKeys = Object.keys(puzzle.answers);
    return allKeys[idx] ?? '';
  }).filter(Boolean);

  // ── WebSocket connection ────────────────────────────────────────────────────

  const connectWs = useCallback(() => {
    if (!sessionId || !playerId) return;
    if (wsRef.current && wsRef.current.readyState <= 1) return; // already open/connecting

    const base = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
    const wsBase = base.replace('https://', 'wss://').replace('http://', 'ws://');
    const wsUrl = `${wsBase}/ws/game/${sessionId}?playerId=${encodeURIComponent(playerId)}&playerName=${encodeURIComponent(playerName)}`;

    console.log('[Game] Connecting WS:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Game] WS connected');
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        console.log('[Game] WS message:', msg.type);

        if (msg.type === 'word_completed' && msg.playerId !== playerId) {
          // Opponent completed a word
          const allKeys = Object.keys(puzzle.answers);
          const idx = typeof msg.wordIndex === 'number'
            ? msg.wordIndex
            : allKeys.indexOf(msg.wordKey ?? '');
          if (idx >= 0) addOpponentWord(idx);
          if (typeof msg.totalScore === 'number') updateOpponentScore(msg.totalScore);
        }

        if (msg.type === 'word_incorrect' && msg.playerId !== playerId) {
          addOpponentError();
        }

        if (msg.type === 'game_over') {
          setWinner(
            msg.winnerId ?? '',
            msg.player1Score ?? 0,
            msg.player2Score ?? 0
          );
          ws.close();
          wsRef.current = null;
          router.push('/results');
        }

        if (msg.type === 'player_disconnected') {
          console.log('[Game] Opponent disconnected');
        }

        if (msg.type === 'game_started') {
          // Already in game — update opponent name if needed
          if (msg.player1Name && msg.player2Name) {
            const oppName = playerNumber === 1 ? msg.player2Name : msg.player1Name;
            setGame({ opponentName: oppName });
          }
        }
      } catch (e) {
        console.log('[Game] WS parse error', e);
      }
    };

    ws.onerror = (e) => {
      console.log('[Game] WS error', e);
    };

    ws.onclose = () => {
      console.log('[Game] WS closed');
      setWsReady(false);
    };
  }, [sessionId, playerId, playerName, playerNumber]);

  useEffect(() => {
    connectWs();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWs]);

  // ── Word submission ─────────────────────────────────────────────────────────

  const handleWordComplete = useCallback(
    async (wordIndex: number, answer: string) => {
      if (!sessionId || !playerId) return;

      try {
        const res = await api.post<WordSubmitResponse>(
          `/api/game/${sessionId}/word`,
          { playerId, wordIndex, answer }
        );

        if (res?.correct) {
          addMyWord(wordIndex);
          if (typeof res.score === 'number') updateMyScore(res.score);
        } else {
          // Flash error indicator
          setFlashError(true);
          setTimeout(() => setFlashError(false), 600);
        }
      } catch (e) {
        console.log('[Game] word submit error', e);
        setFlashError(true);
        setTimeout(() => setFlashError(false), 600);
      }
    },
    [sessionId, playerId, addMyWord, updateMyScore]
  );

  // ── Guard: no session ───────────────────────────────────────────────────────

  if (!sessionId) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]} testID="game-loading">
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="game-screen">
      {/* Score bar */}
      <View style={[styles.scoreBar, flashError && styles.scoreBarError]}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreNameYou} numberOfLines={1}>
            {playerName.toUpperCase()}
          </Text>
          <Text style={styles.scoreValueYou}>{myScore}</Text>
          <Text style={styles.scoreWordCount}>{myWords.length}/15</Text>
        </View>
        <View style={styles.scoreCenter}>
          <Text style={styles.scoreVs}>VS</Text>
          {!wsReady && (
            <ActivityIndicator size="small" color={COLORS.textMuted} style={{ marginTop: 2 }} />
          )}
        </View>
        <View style={[styles.scoreSection, styles.scoreSectionRight]}>
          <Text style={styles.scoreNameOpp} numberOfLines={1}>
            {opponentName.toUpperCase()}
          </Text>
          <Text style={styles.scoreValueOpp}>{opponentScore}</Text>
          <Text style={styles.scoreWordCount}>{opponentWords.length}/15</Text>
        </View>
      </View>

      {/* Crossword grid */}
      <CrosswordGrid
        puzzle={puzzle}
        sessionId={sessionId ?? undefined}
        playerId={playerId ?? undefined}
        clues={gridClues}
        completedWords={completedWordKeys}
        onWordComplete={handleWordComplete}
        isMultiplayer={true}
        myScore={myScore}
        opponentScore={opponentScore}
        myName={playerName}
        opponentName={opponentName}
        opponentWords={opponentWords}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scoreBarError: {
    borderBottomColor: COLORS.error,
  },
  scoreSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  scoreSectionRight: {
    alignItems: 'flex-end',
  },
  scoreNameYou: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreValueYou: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.accent,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreWordCount: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreCenter: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scoreVs: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreNameOpp: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.blue,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreValueOpp: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.blue,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
});
