import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  buildCrossword,
  clearCell,
  enterLetter,
  getNextCell,
  getPrevCell,
  selectCell,
  CrosswordState,
  Word,
} from '../lib/crossword/engine';
import { dailyPuzzle } from '../puzzles/daily';

// ─── colours ────────────────────────────────────────────────────────────────
const C = {
  bg: '#0D0D0D',
  gridBg: '#1A1A1A',
  black: '#111111',
  white: '#F5F0E8',
  selected: '#F5E642',
  wordHighlight: '#3D3820',
  correct: '#1A3D1A',
  text: '#F5F0E8',
  accent: '#F5E642',
  border: '#2A2A2A',
  subText: '#888',
  tabActive: '#F5E642',
  tabInactive: '#444',
};

// ─── reducer ────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SELECT'; row: number; col: number }
  | { type: 'LETTER'; row: number; col: number; letter: string }
  | { type: 'BACKSPACE'; row: number; col: number }
  | { type: 'SELECT_WORD'; wordId: string };

function reducer(state: CrosswordState, action: Action): CrosswordState {
  switch (action.type) {
    case 'SELECT':
      return selectCell(state, action.row, action.col);
    case 'SELECT_WORD': {
      const word = state.words.find(w => w.id === action.wordId);
      if (!word) return state;
      const [r, c] = word.cells[0];
      const next = selectCell(state, r, c);
      // Force direction to match word
      if (next.direction !== word.direction) {
        return { ...next, direction: word.direction, selectedWord: action.wordId };
      }
      return { ...next, selectedWord: action.wordId };
    }
    case 'LETTER': {
      let next = enterLetter(state, action.row, action.col, action.letter);
      // Advance to next cell
      const nextCell = getNextCell(next, action.row, action.col);
      if (nextCell) {
        next = selectCell(next, nextCell[0], nextCell[1]);
        // Keep same word direction after moving forward
        if (state.selectedWord) {
          next = { ...next, selectedWord: state.selectedWord, direction: state.direction };
        }
      }
      return next;
    }
    case 'BACKSPACE': {
      const cell = state.cells[action.row][action.col];
      if (cell.letter) {
        return clearCell(state, action.row, action.col);
      }
      // Move to previous cell
      const prev = getPrevCell(state, action.row, action.col);
      if (prev) {
        let next = selectCell(state, prev[0], prev[1]);
        if (state.selectedWord) {
          next = { ...next, selectedWord: state.selectedWord, direction: state.direction };
        }
        return clearCell(next, prev[0], prev[1]);
      }
      return state;
    }
    default:
      return state;
  }
}

// ─── timer hook ─────────────────────────────────────────────────────────────
function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s: number) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return { display: `${mm}:${ss}`, seconds };
}

// ─── main component ─────────────────────────────────────────────────────────
export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const clueListRef = useRef<FlatList>(null);
  const [clueTab, setClueTab] = useState<'across' | 'down'>('across');
  const [showComplete, setShowComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(true);

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    buildCrossword(dailyPuzzle)
  );

  const { display: timerDisplay, seconds: timerSeconds } = useTimer(
    gameStarted && !showComplete
  );

  // Show completion overlay when puzzle is solved
  useEffect(() => {
    if (state.isComplete && !showComplete) {
      setShowComplete(true);
    }
  }, [state.isComplete]);

  // Calculate cell size from screen width
  const screenWidth = Dimensions.get('window').width;
  const GRID_PADDING = 12;
  const cellSize = Math.floor(
    (screenWidth - GRID_PADDING * 2) / state.gridSize
  );

  // Focus hidden input whenever selection changes
  useEffect(() => {
    if (state.selectedCell) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [state.selectedCell]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      dispatch({ type: 'SELECT', row, col });
    },
    []
  );

  // Determine cell visual state
  const getCellStyle = useCallback(
    (row: number, col: number) => {
      const cell = state.cells[row][col];
      if (cell.isBlack) return styles.cellBlack;

      // Check if cell is in a correct word
      const inCorrectWord = state.words.some(
        (w: Word) => w.isCorrect && w.cells.some(([r, c]: [number, number]) => r === row && c === col)
      );
      if (inCorrectWord) return styles.cellCorrect;

      if (
        state.selectedCell &&
        state.selectedCell[0] === row &&
        state.selectedCell[1] === col
      ) {
        return styles.cellSelected;
      }

      if (state.selectedWord) {
        const word = state.words.find((w: Word) => w.id === state.selectedWord);
        if (word && word.cells.some(([r, c]: [number, number]) => r === row && c === col)) {
          return styles.cellWordHighlight;
        }
      }

      return styles.cellWhite;
    },
    [state.cells, state.selectedCell, state.selectedWord, state.words]
  );

  // Text input handler
  const handleTextChange = useCallback(
    (text: string) => {
      if (!state.selectedCell) return;
      const [row, col] = state.selectedCell;
      // TextInput sends the new character appended; extract it
      const letter = text.slice(-1).toUpperCase();
      if (letter && /[A-Z]/.test(letter)) {
        dispatch({ type: 'LETTER', row, col, letter });
      }
    },
    [state.selectedCell]
  );

  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }) => {
      if (!state.selectedCell) return;
      const [row, col] = state.selectedCell;
      if (e.nativeEvent.key === 'Backspace') {
        dispatch({ type: 'BACKSPACE', row, col });
      }
    },
    [state.selectedCell]
  );

  // Active clue text
  const activeWord = useMemo(
    () => state.words.find((w: Word) => w.id === state.selectedWord) ?? null,
    [state.words, state.selectedWord]
  );

  // Clue list for tabs
  const acrossClues = useMemo(
    () => state.words.filter((w: Word) => w.direction === 'across'),
    [state.words]
  );
  const downClues = useMemo(
    () => state.words.filter((w: Word) => w.direction === 'down'),
    [state.words]
  );
  const visibleClues = clueTab === 'across' ? acrossClues : downClues;

  // Format timer for completion overlay
  const finalTime = useMemo(() => {
    const mm = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const ss = String(timerSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [timerSeconds]);

  // ── render grid ────────────────────────────────────────────────────────────
  const renderGrid = () => (
    <View
      style={[
        styles.gridContainer,
        {
          width: cellSize * state.gridSize + 2,
          height: cellSize * state.gridSize + 2,
        },
      ]}
      testID="crossword-grid"
    >
      {state.cells.map((rowArr: import('../lib/crossword/engine').Cell[], rowIdx: number) =>
        rowArr.map((cell: import('../lib/crossword/engine').Cell, colIdx: number) => {
          const cellSt = getCellStyle(rowIdx, colIdx);
          const isSelectedCell =
            state.selectedCell?.[0] === rowIdx &&
            state.selectedCell?.[1] === colIdx;
          return (
            <Pressable
              key={`${rowIdx}-${colIdx}`}
              testID={`cell-${rowIdx}-${colIdx}`}
              onPress={() => !cell.isBlack && handleCellPress(rowIdx, colIdx)}
              style={[
                styles.cell,
                cellSt,
                {
                  width: cellSize,
                  height: cellSize,
                  top: rowIdx * cellSize,
                  left: colIdx * cellSize,
                },
              ]}
            >
              {!cell.isBlack && (
                <>
                  {cell.number !== undefined && (
                    <Text
                      style={[
                        styles.cellNumber,
                        { fontSize: Math.max(7, cellSize * 0.22) },
                        isSelectedCell && styles.cellNumberSelected,
                      ]}
                    >
                      {cell.number}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.cellLetter,
                      { fontSize: Math.max(14, cellSize * 0.52) },
                      isSelectedCell && styles.cellLetterSelected,
                    ]}
                  >
                    {cell.letter}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })
      )}
    </View>
  );

  // ── render clue list item ──────────────────────────────────────────────────
  const renderClueItem = ({ item }: { item: Word }) => {
    const isActive = item.id === state.selectedWord;
    return (
      <Pressable
        testID={`clue-${item.id}`}
        onPress={() => dispatch({ type: 'SELECT_WORD', wordId: item.id })}
        style={[styles.clueItem, isActive && styles.clueItemActive]}
      >
        <Text
          style={[styles.clueNumber, isActive && styles.clueNumberActive]}
        >
          {item.number}
        </Text>
        <Text
          style={[styles.clueText, isActive && styles.clueTextActive]}
          numberOfLines={2}
        >
          {item.clue}
        </Text>
        {item.isCorrect && (
          <Text style={styles.clueCheck}>✓</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      testID="game-screen"
    >
      {/* Hidden TextInput for keyboard */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value=""
        onChangeText={handleTextChange}
        onKeyPress={handleKeyPress}
        autoCapitalize="characters"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="default"
        returnKeyType="done"
        testID="hidden-input"
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>CROSSWORD DUEL</Text>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText} testID="timer">{timerDisplay}</Text>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${state.completionPercent}%` },
          ]}
        />
      </View>

      {/* ── Grid ── */}
      <View style={styles.gridWrapper}>
        <ScrollView
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        >
          {renderGrid()}
        </ScrollView>
      </View>

      {/* ── Active clue bar ── */}
      <Pressable
        testID="active-clue-bar"
        style={styles.activeClueBar}
        onPress={() => {
          if (state.selectedCell) {
            dispatch({
              type: 'SELECT',
              row: state.selectedCell[0],
              col: state.selectedCell[1],
            });
          }
        }}
      >
        {activeWord ? (
          <View style={styles.activeClueContent}>
            <View style={styles.activeClueLabel}>
              <Text style={styles.activeClueNum}>{activeWord.number}</Text>
              <Text style={styles.activeClueDir}>
                {activeWord.direction === 'across' ? '→' : '↓'}
              </Text>
            </View>
            <Text style={styles.activeClueClue} numberOfLines={2}>
              {activeWord.clue}
            </Text>
          </View>
        ) : (
          <Text style={styles.activeClueEmpty}>Tap a cell to begin</Text>
        )}
      </Pressable>

      {/* ── Clue tabs ── */}
      <View style={styles.clueTabs}>
        <Pressable
          testID="tab-across"
          style={[styles.clueTab, clueTab === 'across' && styles.clueTabActive]}
          onPress={() => setClueTab('across')}
        >
          <Text
            style={[
              styles.clueTabText,
              clueTab === 'across' && styles.clueTabTextActive,
            ]}
          >
            ACROSS
          </Text>
        </Pressable>
        <Pressable
          testID="tab-down"
          style={[styles.clueTab, clueTab === 'down' && styles.clueTabActive]}
          onPress={() => setClueTab('down')}
        >
          <Text
            style={[
              styles.clueTabText,
              clueTab === 'down' && styles.clueTabTextActive,
            ]}
          >
            DOWN
          </Text>
        </Pressable>
      </View>

      {/* ── Clue list ── */}
      <FlatList
        ref={clueListRef}
        data={visibleClues}
        keyExtractor={(item: Word) => item.id}
        renderItem={renderClueItem}
        style={styles.clueList}
        contentContainerStyle={styles.clueListContent}
        showsVerticalScrollIndicator={false}
        testID="clue-list"
      />

      {/* ── Completion overlay ── */}
      {showComplete && (
        <View style={styles.completionOverlay} testID="completion-overlay">
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🏆</Text>
            <Text style={styles.completionTitle}>Puzzle Complete!</Text>
            <Text style={styles.completionSubtitle}>Solved in</Text>
            <Text style={styles.completionTime}>{finalTime}</Text>
            <Pressable
              testID="play-again-button"
              style={styles.completionBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.completionBtnText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  hiddenInput: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: C.accent,
    fontSize: 20,
    lineHeight: 22,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: C.accent,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  timerContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  timerText: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Progress bar
  progressBar: {
    height: 2,
    backgroundColor: '#222',
  },
  progressFill: {
    height: 2,
    backgroundColor: C.accent,
  },

  // Grid
  gridWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: C.bg,
  },
  gridScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
  },

  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#333',
  },
  cellBlack: {
    backgroundColor: C.black,
    borderColor: '#222',
  },
  cellWhite: {
    backgroundColor: C.white,
  },
  cellSelected: {
    backgroundColor: C.selected,
  },
  cellWordHighlight: {
    backgroundColor: C.wordHighlight,
  },
  cellCorrect: {
    backgroundColor: C.correct,
  },
  cellNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    color: '#333',
    fontWeight: '700',
    lineHeight: 10,
  },
  cellNumberSelected: {
    color: '#333',
  },
  cellLetter: {
    color: '#111',
    fontWeight: '800',
    textAlign: 'center',
  },
  cellLetterSelected: {
    color: '#111',
  },

  // Active clue bar
  activeClueBar: {
    marginHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  activeClueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeClueLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: C.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeClueNum: {
    color: '#111',
    fontWeight: '800',
    fontSize: 13,
  },
  activeClueDir: {
    color: '#111',
    fontSize: 12,
    marginLeft: 2,
  },
  activeClueClue: {
    flex: 1,
    color: C.text,
    fontSize: 13,
    lineHeight: 18,
  },
  activeClueEmpty: {
    color: C.subText,
    fontSize: 13,
    textAlign: 'center',
  },

  // Clue tabs
  clueTabs: {
    flexDirection: 'row',
    marginHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 4,
  },
  clueTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clueTabActive: {
    backgroundColor: '#2A2A1A',
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
  },
  clueTabText: {
    color: C.tabInactive,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clueTabTextActive: {
    color: C.tabActive,
  },

  // Clue list
  clueList: {
    flex: 1,
    marginHorizontal: 12,
  },
  clueListContent: {
    paddingBottom: 16,
  },
  clueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
    borderRadius: 4,
  },
  clueItemActive: {
    backgroundColor: '#2A2A1A',
    borderRadius: 6,
    borderBottomColor: 'transparent',
  },
  clueNumber: {
    color: C.subText,
    fontSize: 12,
    fontWeight: '700',
    width: 24,
    marginTop: 1,
  },
  clueNumberActive: {
    color: C.accent,
  },
  clueText: {
    flex: 1,
    color: '#BBB',
    fontSize: 13,
    lineHeight: 18,
  },
  clueTextActive: {
    color: C.text,
  },
  clueCheck: {
    color: '#4CAF50',
    fontSize: 14,
    marginLeft: 6,
    marginTop: 1,
  },

  // Completion overlay
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  completionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.accent,
    width: 300,
  },
  completionEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  completionTitle: {
    color: C.accent,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  completionSubtitle: {
    color: C.subText,
    fontSize: 14,
    marginBottom: 4,
  },
  completionTime: {
    color: C.text,
    fontSize: 40,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    marginBottom: 28,
  },
  completionBtn: {
    backgroundColor: C.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  completionBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
  },
});
