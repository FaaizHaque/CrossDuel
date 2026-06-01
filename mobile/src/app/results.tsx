import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '@/lib/state/gameStore';
import { api } from '@/lib/api/api';
import { Trophy, Circle, Minus } from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameResults {
  winnerId: string | null;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  player1Words: string[];
  player2Words: string[];
  player1Errors: number;
  player2Errors: number;
}

const COLORS = {
  bg: '#0A0A0A',
  card: '#141414',
  cardBorder: '#1E1E1E',
  accent: '#F5E642',
  accentDim: '#C4B730',
  textPrimary: '#F5F5F0',
  textMuted: '#555555',
  textSecondary: '#888888',
  success: '#4CAF50',
  error: '#FF4444',
  blue: '#3B82F6',
  gold: '#FFD700',
  winnerBorder: '#F5E642',
  loserBorder: '#2A2A2A',
};

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();

  // Store selectors
  const sessionId = useGameStore((s) => s.sessionId);
  const playerId = useGameStore((s) => s.playerId);
  const playerName = useGameStore((s) => s.playerName);
  const opponentName = useGameStore((s) => s.opponentName);
  const myScore = useGameStore((s) => s.myScore);
  const opponentScore = useGameStore((s) => s.opponentScore);
  const myWords = useGameStore((s) => s.myWords);
  const opponentWords = useGameStore((s) => s.opponentWords);
  const myErrors = useGameStore((s) => s.myErrors);
  const opponentErrors = useGameStore((s) => s.opponentErrors);
  const winnerId = useGameStore((s) => s.winnerId);
  const resetGame = useGameStore((s) => s.resetGame);

  // Remote results (may override local state)
  const [results, setResults] = useState<GameResults | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleWinner = useRef(new Animated.Value(0.85)).current;
  const scaleTrophy = useRef(new Animated.Value(0)).current;

  // Fetch final results from server
  useEffect(() => {
    if (!sessionId) return;
    api.get<GameResults>(`/api/game/${sessionId}/results`)
      .then((res) => {
        if (res) setResults(res);
      })
      .catch(() => {
        // Fall back to local store data
      });
  }, [sessionId]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleWinner, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(scaleTrophy, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Determine winner
  const effectiveWinnerId = results?.winnerId ?? winnerId;
  const iAmWinner = effectiveWinnerId === playerId;
  const isTie = effectiveWinnerId === null;

  // Final scores (server results preferred)
  const finalMyScore = results
    ? (results.player1Id === playerId ? results.player1Score : results.player2Score)
    : myScore;
  const finalOppScore = results
    ? (results.player1Id === playerId ? results.player2Score : results.player1Score)
    : opponentScore;
  const finalMyWords = results
    ? (results.player1Id === playerId ? results.player1Words : results.player2Words)
    : myWords;
  const finalOppWords = results
    ? (results.player1Id === playerId ? results.player2Words : results.player1Words)
    : opponentWords;
  const finalMyErrors = results
    ? (results.player1Id === playerId ? results.player1Errors : results.player2Errors)
    : myErrors;
  const finalOppErrors = results
    ? (results.player1Id === playerId ? results.player2Errors : results.player1Errors)
    : opponentErrors;

  const handlePlayAgain = () => {
    resetGame();
    router.replace('/(tabs)/two');
  };

  const handleBackToHome = () => {
    resetGame();
    router.replace('/');
  };

  // Outcome label
  const outcomeLabel = isTie ? 'DRAW' : iAmWinner ? 'VICTORY' : 'DEFEAT';
  const outcomeColor = isTie ? COLORS.accent : iAmWinner ? COLORS.success : COLORS.error;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="results-screen">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Trophy / outcome */}
          <View style={styles.heroSection}>
            <Animated.View
              style={[
                styles.trophyCircle,
                {
                  transform: [{ scale: scaleTrophy }],
                  borderColor: outcomeColor,
                  ...(iAmWinner && !isTie
                    ? {
                        shadowColor: '#F5E642',
                        shadowOpacity: 0.5,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 0 },
                      }
                    : {}),
                },
              ]}
            >
              {isTie ? (
                <Minus size={44} color={outcomeColor} />
              ) : iAmWinner ? (
                <Trophy size={44} color={outcomeColor} />
              ) : (
                <Circle size={44} color={outcomeColor} />
              )}
            </Animated.View>
            <Text style={[styles.outcomeLabel, { color: outcomeColor }]}>{outcomeLabel}</Text>
            <Text style={styles.outcomeSubtitle}>
              {isTie
                ? "It's a tie! Well played, both of you."
                : iAmWinner
                ? 'You dominated the grid!'
                : 'Better luck next time!'}
            </Text>
          </View>

          {/* Player cards */}
          <View style={styles.cardsRow}>
            {/* My card */}
            <Animated.View
              style={[
                styles.playerCard,
                iAmWinner && styles.playerCardWinner,
                { transform: [{ scale: iAmWinner ? scaleWinner : new Animated.Value(1) }] },
              ]}
            >
              {iAmWinner ? (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerBadgeText}>WINNER</Text>
                </View>
              ) : null}
              <Text style={styles.cardPlayerLabel}>YOU</Text>
              <Text style={[styles.cardPlayerName, iAmWinner && { color: COLORS.accent }]} numberOfLines={1}>
                {playerName}
              </Text>
              <Text style={[styles.cardScore, iAmWinner && { color: COLORS.accent }]}>
                {finalMyScore}
              </Text>
              <Text style={styles.cardScoreLabel}>PTS</Text>
              <View style={styles.cardStats}>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{finalMyWords.length}</Text>
                  <Text style={styles.cardStatLabel}>WORDS</Text>
                </View>
                <View style={styles.cardStatDivider} />
                <View style={styles.cardStat}>
                  <Text style={[styles.cardStatValue, finalMyErrors > 0 && { color: COLORS.error }]}>
                    {finalMyErrors}
                  </Text>
                  <Text style={styles.cardStatLabel}>ERRORS</Text>
                </View>
              </View>
            </Animated.View>

            {/* Divider */}
            <View style={styles.cardsDivider}>
              <Text style={styles.cardsDividerText}>VS</Text>
            </View>

            {/* Opponent card */}
            <Animated.View
              style={[
                styles.playerCard,
                !iAmWinner && !isTie && styles.playerCardWinner,
                { transform: [{ scale: !iAmWinner && !isTie ? scaleWinner : new Animated.Value(1) }] },
              ]}
            >
              {!iAmWinner && !isTie ? (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerBadgeText}>WINNER</Text>
                </View>
              ) : null}
              <Text style={styles.cardPlayerLabel}>OPP</Text>
              <Text
                style={[styles.cardPlayerName, !iAmWinner && !isTie && { color: COLORS.blue }]}
                numberOfLines={1}
              >
                {opponentName}
              </Text>
              <Text style={[styles.cardScore, !iAmWinner && !isTie && { color: COLORS.blue }]}>
                {finalOppScore}
              </Text>
              <Text style={styles.cardScoreLabel}>PTS</Text>
              <View style={styles.cardStats}>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{finalOppWords.length}</Text>
                  <Text style={styles.cardStatLabel}>WORDS</Text>
                </View>
                <View style={styles.cardStatDivider} />
                <View style={styles.cardStat}>
                  <Text style={[styles.cardStatValue, finalOppErrors > 0 && { color: COLORS.error }]}>
                    {finalOppErrors}
                  </Text>
                  <Text style={styles.cardStatLabel}>ERRORS</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Score breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>GAME SUMMARY</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Words completed</Text>
              <Text style={styles.breakdownValue}>
                {finalMyWords.length} / 15
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Opponent words</Text>
              <Text style={styles.breakdownValue}>
                {finalOppWords.length} / 15
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Your final score</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.accent }]}>
                {finalMyScore} pts
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Opponent score</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.blue }]}>
                {finalOppScore} pts
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsSection}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={handlePlayAgain}
              testID="play-again-button"
            >
              <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
              onPress={handleBackToHome}
              testID="back-home-button"
            >
              <Text style={styles.secondaryButtonText}>BACK TO HOME</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  trophyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#111111',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  outcomeLabel: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  outcomeSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // ── Player cards ──────────────────────────────────────────────────────────
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    gap: 8,
  },
  playerCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.loserBorder,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  playerCardWinner: {
    borderColor: COLORS.winnerBorder,
    backgroundColor: '#161610',
  },
  winnerBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    paddingVertical: 3,
    alignItems: 'center',
  },
  winnerBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0A0A0A',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  cardPlayerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginTop: 18,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  cardPlayerName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    maxWidth: '100%',
    textAlign: 'center',
  },
  cardScore: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 44,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  cardScoreLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 10,
    width: '100%',
  },
  cardStat: {
    flex: 1,
    alignItems: 'center',
  },
  cardStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#222222',
  },
  cardStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  cardStatLabel: {
    fontSize: 7,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  cardsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
  },
  cardsDividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Breakdown card ────────────────────────────────────────────────────────
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#222222',
    marginVertical: 10,
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  actionsSection: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.accentDim,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  secondaryButtonPressed: {
    borderColor: COLORS.accent,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
});
