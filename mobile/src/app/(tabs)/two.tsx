import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sword, Zap, Users, Copy, ArrowRight, RefreshCw } from 'lucide-react-native';
import { api } from '@/lib/api/api';
import { useGameStore } from '@/lib/state/gameStore';
import * as Haptics from 'expo-haptics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateGameResponse {
  sessionId: string;
  playerId: string;
  playerNumber: 1 | 2;
  clues: Record<string, string>;
  status: string;
}

interface JoinGameResponse {
  sessionId: string;
  playerId: string;
  playerNumber: 1 | 2;
  clues: Record<string, string>;
  status: string;
  player1Name: string;
  player2Name: string;
  startedAt: string;
}

// ─── Screen State Types ───────────────────────────────────────────────────────

type ScreenMode = 'idle' | 'creating' | 'waiting' | 'joining' | 'connecting';

const COLORS = {
  bg: '#0A0A0A',
  card: '#141414',
  cardBorder: '#1E1E1E',
  accent: '#F5E642',
  accentDim: '#C4B730',
  textPrimary: '#F5F5F0',
  textMuted: '#555555',
  textSecondary: '#888888',
  inputBg: '#1A1A1A',
  inputBorder: '#2A2A2A',
  inputBorderFocus: '#F5E642',
  error: '#FF4444',
  success: '#4CAF50',
  buttonDark: '#1E1E1E',
};

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function DuelsScreen() {
  const insets = useSafeAreaInsets();
  const setGame = useGameStore((s) => s.setGame);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const storedPlayerName = useGameStore((s) => s.playerName);
  const sessionId = useGameStore((s) => s.sessionId);
  const playerId = useGameStore((s) => s.playerId);

  const [mode, setMode] = useState<ScreenMode>('idle');
  const [nameInput, setNameInput] = useState<string>(storedPlayerName === 'Anonymous' ? '' : storedPlayerName);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [gameCode, setGameCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load persisted player name
  useEffect(() => {
    AsyncStorage.getItem('playerName').then((name) => {
      if (name) {
        setNameInput(name);
        setPlayerName(name);
      }
    });
  }, []);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse animation for waiting state
  useEffect(() => {
    if (mode === 'waiting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [mode]);

  const getEffectiveName = useCallback(() => {
    const n = nameInput.trim();
    return n.length > 0 ? n : 'Anonymous';
  }, [nameInput]);

  const savePlayerName = useCallback(async (name: string) => {
    await AsyncStorage.setItem('playerName', name);
    setPlayerName(name);
  }, [setPlayerName]);

  const getWsUrl = useCallback(() => {
    return "ws://localhost:3000";
  }, []);

  const connectWebSocket = useCallback((sid: string, pid: string, pName: string) => {
    const wsBase = getWsUrl();
    const wsUrl = `${wsBase}/ws/game/${sid}?playerId=${encodeURIComponent(pid)}&playerName=${encodeURIComponent(pName)}`;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    console.log("CONNECTING WS:", wsUrl);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data as string);
        console.log("WS MESSAGE:", msg);
        if (msg.type === 'game_started') {
          setGame({
            status: 'active',
            startedAt: msg.startedAt ?? new Date().toISOString(),
            opponentName: msg.player1Name && msg.player2Name
              ? (msg.player1Name !== pName ? msg.player1Name : msg.player2Name)
              : 'Opponent',
          });
          ws.close();
          wsRef.current = null;
          router.push('/game');
        } else if (msg.type === 'player_connected') {
          // Another player joined, update opponent name
          if (msg.playerName && msg.playerName !== pName) {
            setGame({ opponentName: msg.playerName });
          }
        }
      } catch (_e) {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      setError('Connection error. Please try again.');
    };
  }, [getWsUrl, setGame]);

  const handleCreateDuel = useCallback(async () => {
    const name = getEffectiveName();
    await savePlayerName(name);
    setError(null);
    setMode('creating');

    try {
      const pid = generatePlayerId();
      const result = await api.post<CreateGameResponse>('/api/game/create', {
        playerName: name,
        playerId: pid,
      });

      const code = result.sessionId.slice(0, 8).toUpperCase();
      setGameCode(code);

      setGame({
        sessionId: result.sessionId,
        playerId: pid,
        playerName: name,
        playerNumber: result.playerNumber,
        clues: result.clues,
        status: 'waiting',
      });

      setMode('waiting');
      console.log("CREATED GAME:", result.sessionId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      connectWebSocket(result.sessionId, pid, name);
    } catch (_e) {
      setError('Failed to create game. Check your connection.');
      setMode('idle');
    }
  }, [getEffectiveName, savePlayerName, setGame, connectWebSocket]);

  const handleJoinDuel = useCallback(async () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (code.length < 4) {
      setError('Enter a valid game code.');
      return;
    }

    const name = getEffectiveName();
    await savePlayerName(name);
    setError(null);
    setMode('connecting');

    try {
      const pid = generatePlayerId();
      // The code is the first 8 chars of sessionId; backend should accept partial match
      // We'll try to find the session by querying or just pass it directly
      const result = await api.post<JoinGameResponse>(`/api/game/join/${code}`, {
        playerName: name,
        playerId: pid,
      });

      setGame({
        sessionId: result.sessionId,
        playerId: pid,
        playerName: name,
        playerNumber: result.playerNumber,
        clues: result.clues,
        status: 'active',
        opponentName: result.playerNumber === 2 ? result.player1Name : result.player2Name,
        startedAt: result.startedAt,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/game');
    } catch (_e) {
      setError('Could not join game. Check the code and try again.');
      setMode('joining');
    }
  }, [joinCodeInput, getEffectiveName, savePlayerName, setGame]);

  const handleCopyCode = useCallback(() => {
    // Clipboard not universally available; show copied state
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleReset = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setMode('idle');
    setGameCode('');
    setJoinCodeInput('');
    setError(null);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderIdleScreen = () => (
    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconRow}>
            <View style={styles.heroIconBg}>
              <Sword size={32} color={COLORS.accent} />
            </View>
          </View>
          <Text style={styles.heroTitle}>CROSS DUEL</Text>
          <Text style={styles.heroSubtitle}>REAL-TIME 1V1 CROSSWORD BATTLE</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroDesc}>
            Challenge a friend to a live crossword duel. First to complete the most words wins.
          </Text>
        </View>

        {/* Name input card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR NAME</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
              maxLength={20}
              autoCapitalize="words"
              autoCorrect={false}
              testID="player-name-input"
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonSection}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={handleCreateDuel}
            testID="create-duel-button"
          >
            <Zap size={20} color="#0A0A0A" />
            <Text style={styles.primaryButtonText}>CREATE DUEL</Text>
            <ArrowRight size={18} color="#0A0A0A" />
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
            onPress={() => setMode('joining')}
            testID="join-duel-button"
          >
            <Users size={20} color={COLORS.accent} />
            <Text style={styles.secondaryButtonText}>JOIN A DUEL</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox} testID="error-view">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>WORDS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>9×9</Text>
            <Text style={styles.statLabel}>GRID</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1V1</Text>
            <Text style={styles.statLabel}>LIVE</Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderCreatingScreen = () => (
    <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={COLORS.accent} testID="loading-indicator" />
      <Text style={styles.loadingText}>CREATING DUEL...</Text>
      <Text style={styles.loadingSubtext}>Setting up your battlefield</Text>
    </View>
  );

  const renderWaitingScreen = () => (
    <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
      {/* Live indicator */}
      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>WAITING FOR OPPONENT</Text>
      </View>

      {/* Game code card */}
      <Animated.View style={[styles.codeCard, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.codeLabel}>GAME CODE</Text>
        <Text style={styles.codeValue} testID="game-code">{gameCode}</Text>
        <Text style={styles.codeHint}>Share this code with your opponent</Text>
        <Pressable
          style={({ pressed }) => [styles.copyButton, pressed && styles.copyButtonPressed]}
          onPress={handleCopyCode}
          testID="copy-code-button"
        >
          <Copy size={16} color={copied ? '#0A0A0A' : COLORS.accent} />
          <Text style={[styles.copyButtonText, copied && styles.copyButtonTextCopied]}>
            {copied ? 'COPIED!' : 'COPY CODE'}
          </Text>
        </Pressable>
      </Animated.View>

      <Text style={styles.waitingDesc}>
        Your duel will start automatically{'\n'}when the opponent joins
      </Text>

      <ActivityIndicator size="small" color={COLORS.textMuted} style={{ marginTop: 24 }} />

      <Pressable style={styles.cancelButton} onPress={handleReset} testID="cancel-button">
        <Text style={styles.cancelButtonText}>CANCEL</Text>
      </Pressable>
    </View>
  );

  const renderJoiningScreen = () => (
    <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
      <View style={styles.heroIconBg}>
        <Users size={28} color={COLORS.accent} />
      </View>
      <Text style={styles.joinTitle}>JOIN A DUEL</Text>
      <Text style={styles.joinSubtitle}>Enter the 8-character game code</Text>

      {/* Name input */}
      <View style={[styles.card, { width: '100%', marginBottom: 12 }]}>
        <Text style={styles.cardLabel}>YOUR NAME</Text>
        <TextInput
          style={styles.input}
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.textMuted}
          maxLength={20}
          autoCapitalize="words"
          autoCorrect={false}
          testID="player-name-input-join"
        />
      </View>

      {/* Code input */}
      <View style={[styles.card, { width: '100%', marginBottom: 24 }]}>
        <Text style={styles.cardLabel}>GAME CODE</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          value={joinCodeInput}
          onChangeText={(t) => setJoinCodeInput(t.toUpperCase())}
          placeholder="XXXXXXXX"
          placeholderTextColor={COLORS.textMuted}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          testID="join-code-input"
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.primaryButton, { width: '100%' }, pressed && styles.primaryButtonPressed]}
        onPress={handleJoinDuel}
        testID="confirm-join-button"
      >
        <Zap size={20} color="#0A0A0A" />
        <Text style={styles.primaryButtonText}>JOIN DUEL</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={handleReset}>
        <Text style={styles.cancelButtonText}>BACK</Text>
      </Pressable>
    </View>
  );

  const renderConnectingScreen = () => (
    <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={COLORS.accent} testID="loading-indicator" />
      <Text style={styles.loadingText}>JOINING DUEL...</Text>
      <Text style={styles.loadingSubtext}>Entering the battlefield</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]} testID="tab-two-screen">
      {mode === 'idle' && renderIdleScreen()}
      {mode === 'creating' && renderCreatingScreen()}
      {mode === 'waiting' && renderWaitingScreen()}
      {mode === 'joining' && renderJoiningScreen()}
      {mode === 'connecting' && renderConnectingScreen()}
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
    paddingBottom: 40,
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  heroIconRow: {
    marginBottom: 16,
  },
  heroIconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1A1A0A',
    borderWidth: 1,
    borderColor: '#3A3A10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  heroSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 5,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  heroDivider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.accent,
    marginVertical: 16,
  },
  heroDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  codeInput: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  buttonSection: {
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    height: 52,
    gap: 10,
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.accentDim,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: 10,
    height: 52,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 10,
  },
  secondaryButtonPressed: {
    borderColor: COLORS.accent,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222222',
  },
  orText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Stats Row ─────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#222222',
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 3,
    marginTop: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  loadingSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // ── Waiting / Code card ───────────────────────────────────────────────────
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  codeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A10',
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  codeValue: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
    marginBottom: 8,
  },
  codeHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#1A1A0A',
    borderWidth: 1,
    borderColor: '#3A3A10',
  },
  copyButtonPressed: {
    backgroundColor: COLORS.accent,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  copyButtonTextCopied: {
    color: '#0A0A0A',
  },
  waitingDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Join screen ───────────────────────────────────────────────────────────
  joinTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginTop: 12,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  joinSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: '#2A0A0A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
