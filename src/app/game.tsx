import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { buildCrossword, clearCell, enterLetter, getNextCell, getPrevCell, selectCell } from '@/lib/crossword/engine';
import { NATURE_PUZZLE } from '@/lib/crossword/puzzle';
import { CrosswordState, Direction, PuzzleWord } from '@/lib/crossword/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2) / NATURE_PUZZLE.gridSize);

// ─── Reducer ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'ENTER_LETTER'; letter: string }
  | { type: 'BACKSPACE' }
  | { type: 'SELECT_WORD'; wordId: string }
  | { type: 'DESELECT' };

function gameReducer(state: CrosswordState, action: Action): CrosswordState {
  switch (action.type) {
    case 'SELECT_CELL': {
      return selectCell(state, action.row, action.col);
    }
    case 'ENTER_LETTER': {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;
      const newState = enterLetter(state, row, col, action.letter);
      // Advance to next cell
      const next = getNextCell(newState);
      if (next) return selectCell(newState, next[0], next[1]);
      return newState;
    }
    case 'BACKSPACE': {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;
      const cell = state.cells[row]?.[col];
      if (cell && cell.letter) {
        // Clear current cell
        return clearCell(state, row, col);
      } else {
        // Move to previous cell and clear it
        const prev = getPrevCell(state);
        if (prev) {
          const cleared = clearCell(state, prev[0], prev[1]);
          return selectCell(cleared, prev[0], prev[1]);
        }
        return state;
      }
    }
    case 'SELECT_WORD': {
      const word = state.puzzle.words.find(w => w.id === action.wordId);
      if (!word) return state;
      const newState: CrosswordState = { ...state, selectedWordId: word.id, direction: word.direction };
      return selectCell(newState, word.row, word.col);
    }
    case 'DESELECT': {
      return { ...state, selectedCell: null, selectedWordId: null };
    }
    default:
      return state;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getCellStyle(
  state: CrosswordState,
  row: number,
  col: number,
): object[] {
  const cell = state.cells[row]?.[col];
  if (!cell) return [styles.cell];
  if (cell.isBlack) return [styles.cell, styles.cellBlack];

  const isSelected = state.selectedCell?.[0] === row && state.selectedCell?.[1] === col;
  const inWord =
    state.selectedWordId &&
    (cell.acrossWordId === state.selectedWordId || cell.downWordId === state.selectedWordId);

  const wordId = cell.acrossWordId ?? cell.downWordId;
  const isCorrect = wordId ? state.solvedWords[wordId]?.isCorrect : false;
  const wordAcrossCorrect = cell.acrossWordId ? state.solvedWords[cell.acrossWordId]?.isCorrect : false;
  const wordDownCorrect = cell.downWordId ? state.solvedWords[cell.downWordId]?.isCorrect : false;
  const anyCorrect = wordAcrossCorrect || wordDownCorrect;

  if (isSelected) return [styles.cell, styles.cellSelected];
  if (anyCorrect) return [styles.cell, styles.cellCorrect];
  if (inWord) return [styles.cell, styles.cellInWord];
  return [styles.cell, styles.cellWhite];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function GameScreen() {
  const router = useRouter();
  const [state, dispatch] = useReducer(gameReducer, NATURE_PUZZLE, buildCrossword);
  const [seconds, setSeconds] = useState<number>(0);
  const [clueTab, setClueTab] = useState<Direction>('across');
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);
  const clueListRef = useRef<FlatList<PuzzleWord>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (state.isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.isComplete]);

  // Show completion modal
  useEffect(() => {
    if (state.isComplete) setShowComplete(true);
  }, [state.isComplete]);

  // Keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Active word & clue
  const activeWord = useMemo(
    () => state.puzzle.words.find(w => w.id === state.selectedWordId) ?? null,
    [state.selectedWordId, state.puzzle.words],
  );

  // Sorted clue lists
  const acrossWords = useMemo(
    () => state.puzzle.words.filter(w => w.direction === 'across').sort((a, b) => a.number - b.number),
    [state.puzzle.words],
  );
  const downWords = useMemo(
    () => state.puzzle.words.filter(w => w.direction === 'down').sort((a, b) => a.number - b.number),
    [state.puzzle.words],
  );
  const clueList = clueTab === 'across' ? acrossWords : downWords;

  // Scroll clue list to active clue
  useEffect(() => {
    if (!activeWord || activeWord.direction !== clueTab) return;
    const list = clueTab === 'across' ? acrossWords : downWords;
    const idx = list.findIndex(w => w.id === activeWord.id);
    if (idx >= 0) {
      clueListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    }
  }, [activeWord, clueTab, acrossWords, downWords]);

  const handleCellPress = useCallback((row: number, col: number) => {
    dispatch({ type: 'SELECT_CELL', row, col });
    inputRef.current?.focus();
  }, []);

  const handleTextChange = useCallback((text: string) => {
    if (!text) return;
    const last = text[text.length - 1];
    if (/[a-zA-Z]/.test(last)) {
      dispatch({ type: 'ENTER_LETTER', letter: last.toUpperCase() });
    }
    // Reset input so we can detect next character
    inputRef.current?.setNativeProps({ text: '' });
  }, []);

  const handleKeyPress = useCallback((e: { nativeEvent: { key: string } }) => {
    if (e.nativeEvent.key === 'Backspace') {
      dispatch({ type: 'BACKSPACE' });
    }
  }, []);

  const handleSelectWord = useCallback((wordId: string) => {
    dispatch({ type: 'SELECT_WORD', wordId });
    inputRef.current?.focus();
  }, []);

  const handlePlayAgain = useCallback(() => {
    setShowComplete(false);
    setSeconds(0);
    // Re-initialize state
    dispatch({ type: 'SELECT_CELL', row: -1, col: -1 }); // dummy to reset - we'll use key
  }, []);

  const progressPercent = state.totalWords > 0 ? state.correctCount / state.totalWords : 0;

  const handleDone = useCallback(() => {
    inputRef.current?.blur();
    dispatch({ type: 'DESELECT' });
  }, []);

  return (
    <SafeAreaView style={styles.container} testID="game-screen">
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      {/* Hidden keyboard input */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        autoCapitalize="characters"
        autoCorrect={false}
        onChangeText={handleTextChange}
        onKeyPress={handleKeyPress}
        testID="keyboard-input"
        caretHidden
        blurOnSubmit={false}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          testID="back-button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CROSS-DUEL</Text>
        <Text style={styles.timer} testID="timer">{formatTime(seconds)}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{state.correctCount} / {state.totalWords} words</Text>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
        </View>
      </View>

      {/* ── Active Clue Bar ── */}
      <TouchableOpacity
        style={styles.clueBar}
        onPress={() => {
          if (activeWord && state.selectedCell) {
            const [r, c] = state.selectedCell;
            dispatch({ type: 'SELECT_CELL', row: r, col: c });
          }
        }}
        testID="clue-bar"
        activeOpacity={0.8}
      >
        {activeWord ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.clueBarText}>
              <Text style={styles.clueBarNumber}>{activeWord.number}{activeWord.direction === 'across' ? 'A' : 'D'} </Text>
              <Text style={styles.clueBarArrow}>{activeWord.direction === 'across' ? '→ ' : '↓ '}</Text>
              {activeWord.clue}
            </Text>
          </ScrollView>
        ) : (
          <Text style={styles.clueBarPlaceholder}>Tap a cell to begin</Text>
        )}
      </TouchableOpacity>

      {/* ── Grid ── */}
      <View style={styles.gridWrapper} testID="crossword-grid">
        <View style={styles.grid}>
          {Array.from({ length: state.gridSize }, (_, row) => (
            <View key={row} style={styles.gridRow}>
              {Array.from({ length: state.gridSize }, (_, col) => {
                const cell = state.cells[row]?.[col];
                if (!cell) return null;
                return (
                  <TouchableOpacity
                    key={col}
                    style={getCellStyle(state, row, col)}
                    onPress={() => !cell.isBlack && handleCellPress(row, col)}
                    activeOpacity={cell.isBlack ? 1 : 0.7}
                    testID={`cell-${row}-${col}`}
                  >
                    {!cell.isBlack && cell.number !== undefined && (
                      <Text style={styles.cellNumber}>{cell.number}</Text>
                    )}
                    {!cell.isBlack && (
                      <Text style={[
                        styles.cellLetter,
                        state.selectedCell?.[0] === row && state.selectedCell?.[1] === col
                          ? styles.cellLetterSelected
                          : null,
                      ]}>
                        {cell.letter}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* ── Clue Tabs ── */}
      <View style={styles.clueSection}>
        <View style={styles.clueTabs}>
          <TouchableOpacity
            style={[styles.clueTab, clueTab === 'across' && styles.clueTabActive]}
            onPress={() => setClueTab('across')}
            testID="tab-across"
          >
            <Text style={[styles.clueTabText, clueTab === 'across' && styles.clueTabTextActive]}>
              ACROSS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clueTab, clueTab === 'down' && styles.clueTabActive]}
            onPress={() => setClueTab('down')}
            testID="tab-down"
          >
            <Text style={[styles.clueTabText, clueTab === 'down' && styles.clueTabTextActive]}>
              DOWN
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={clueListRef}
          data={clueList}
          keyExtractor={item => item.id}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          style={styles.clueList}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => {
            const isActive = item.id === state.selectedWordId;
            const isSolved = state.solvedWords[item.id]?.isCorrect;
            return (
              <TouchableOpacity
                style={[styles.clueRow, isActive && styles.clueRowActive]}
                onPress={() => handleSelectWord(item.id)}
                testID={`clue-${item.id}`}
                activeOpacity={0.7}
              >
                <View style={[styles.clueNumberBadge, isActive && styles.clueNumberBadgeActive, isSolved && styles.clueNumberBadgeSolved]}>
                  <Text style={[styles.clueNumberBadgeText, isActive && styles.clueNumberBadgeTextActive]}>
                    {item.number}
                  </Text>
                </View>
                <Text style={[styles.clueRowText, isActive && styles.clueRowTextActive, isSolved && styles.clueRowTextSolved]} numberOfLines={2}>
                  {item.clue}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Done Pill Button (floating above keyboard) ── */}
      {keyboardVisible && (
        <TouchableOpacity
          style={styles.donePill}
          onPress={handleDone}
          testID="done-button"
          activeOpacity={0.85}
        >
          <Text style={styles.donePillText}>Done</Text>
        </TouchableOpacity>
      )}
      </KeyboardAvoidingView>

      {/* ── Completion Modal ── */}
      <Modal
        visible={showComplete}
        transparent
        animationType="fade"
        testID="completion-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Puzzle Complete!</Text>
            <Text style={styles.modalSubtitle}>You solved it in</Text>
            <Text style={styles.modalTime}>{formatTime(seconds)}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setShowComplete(false); router.back(); }}
              testID="play-again-button"
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EE',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  donePill: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  donePillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  hiddenInput: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
    opacity: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#2D6A4F',
    fontFamily: 'Nunito_700Bold',
  },
  headerTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: '#1A1A2E',
    letterSpacing: 2,
  },
  timer: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#F4A261',
    width: 60,
    textAlign: 'right',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2D6A4F',
    borderRadius: 2,
  },

  // Clue bar
  clueBar: {
    height: 52,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  clueBarText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
  clueBarNumber: {
    fontFamily: 'Nunito_700Bold',
    color: '#2D6A4F',
  },
  clueBarArrow: {
    color: '#2D6A4F',
  },
  clueBarPlaceholder: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Grid
  gridWrapper: {
    padding: GRID_PADDING,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  grid: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#E0E0E0',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellBlack: {
    backgroundColor: '#2D2D2D',
    borderColor: '#2D2D2D',
  },
  cellWhite: {
    backgroundColor: '#FFFFFF',
  },
  cellSelected: {
    backgroundColor: '#2D6A4F',
  },
  cellInWord: {
    backgroundColor: '#E8F5E9',
  },
  cellCorrect: {
    backgroundColor: '#FFF3CD',
  },
  cellNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 8,
    color: '#9CA3AF',
    fontFamily: 'Nunito_400Regular',
    lineHeight: 10,
  },
  cellLetter: {
    fontFamily: 'Nunito_700Bold',
    fontSize: CELL_SIZE * 0.55,
    color: '#1A1A2E',
    lineHeight: CELL_SIZE * 0.7,
  },
  cellLetterSelected: {
    color: '#FFFFFF',
  },

  // Clue section
  clueSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clueTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  clueTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  clueTabActive: {
    borderBottomColor: '#2D6A4F',
  },
  clueTabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  clueTabTextActive: {
    color: '#2D6A4F',
  },
  clueList: {
    flex: 1,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  clueRowActive: {
    backgroundColor: '#F0FDF4',
  },
  clueNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  clueNumberBadgeActive: {
    backgroundColor: '#2D6A4F',
  },
  clueNumberBadgeSolved: {
    backgroundColor: '#FFF3CD',
  },
  clueNumberBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#6B7280',
  },
  clueNumberBadgeTextActive: {
    color: '#FFFFFF',
  },
  clueRowText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  clueRowTextActive: {
    fontFamily: 'Nunito_700Bold',
    color: '#1A1A2E',
  },
  clueRowTextSolved: {
    color: '#2D6A4F',
    textDecorationLine: 'line-through',
  },

  // Completion modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    color: '#1A1A2E',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalTime: {
    fontFamily: 'Nunito_900Black',
    fontSize: 40,
    color: '#2D6A4F',
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
