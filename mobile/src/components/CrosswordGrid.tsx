import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { puzzles } from '../puzzles';

// ─── Constants ────────────────────────────────────────────────────────────────




const COLORS = {
  background: '#0A0A0A',
  cellWhite: '#F0ECD8',
  cellBlack: '#1A1A1A',
  cellWordHighlight: '#E8E0C8',
  cellActive: '#F5E642',
  cellCompleted: '#2A5C3F',
  cellCompletedBorder: '#3D8A5E',
  cellCompletedText: '#FFFFFF',
  cellOpponent: '#1A2B4A',
  cellOpponentBorder: '#3B82F6',
  accent: '#F5E642',
  border: '#333333',
  borderStrong: '#333333',
  textDark: '#0A0A0A',
  textMuted: '#666666',
  textOnDark: '#F5F5F0',
  textNumber: '#555555',
  textNumberOnDark: '#AAAAAA',
  buttonBg: '#1E1E1E',
  buttonActiveBg: '#F5E642',
  buttonText: '#999999',
  buttonActiveText: '#0A0A0A',
  scoreBarBg: '#111111',
  scoreBarBorder: '#222222',
  gridBg: '#0A0A0A',
};

// ─── Word position map ────────────────────────────────────────────────────────
// Maps word keys to grid positions: { row, startCol, length }
// ─── Word position map ────────────────────────────────────────────────────────


// ─── Word Number Map ──────────────────────────────────────────────────────────
// ─── Word Number Map ──────────────────────────────────────────────────────────
 

// ─── Types ────────────────────────────────────────────────────────────────────

interface CellCoord {
  row: number;
  col: number;
}

type Direction = 'across' | 'down';

// ─── Component Interface ──────────────────────────────────────────────────────

interface CrosswordGridProps {
  puzzle?: any;
  sessionId?: string;
  playerId?: string;
  // Multiplayer props
  clues?: Record<string, string>;
  completedWords?: string[];
  onWordComplete?: (wordIndex: number, answer: string) => void;
  isMultiplayer?: boolean;
  myScore?: number;
  opponentScore?: number;
  myName?: string;
  opponentName?: string;
  opponentWords?: number[];
}

export default function CrosswordGrid(props: CrosswordGridProps) {
  const {
    puzzle,
    clues = {},
    completedWords = [],
    onWordComplete,
    isMultiplayer = false,
    myScore = 0,
    opponentScore = 0,
    myName = 'YOU',
    opponentName = 'OPPONENT',
    opponentWords = [],
  } = props;

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  
  const puzzleData = puzzle || puzzles[puzzleIndex];
  
  const GRID_SIZE = puzzleData.gridSize;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.min(
  Math.floor((SCREEN_WIDTH - 24) / GRID_SIZE),
  44
);
const WORD_POSITIONS = puzzleData.wordPositions;
function isBlackCell(row: number, col: number) {
  return puzzleData.blackCells.includes(`${row},${col}`);
}

function isValidCell(row: number, col: number) {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function isWhiteCell(row: number, col: number) {
  return isValidCell(row, col) && !isBlackCell(row, col);
}

function getWordCells(row: number, col: number, dir: Direction): CellCoord[] {
  if (isBlackCell(row, col)) return [];

  const cells: CellCoord[] = [];

  if (dir === 'across') {
    let startCol = col;
    while (startCol > 0 && isWhiteCell(row, startCol - 1)) startCol--;

    let c = startCol;
    while (c < GRID_SIZE && isWhiteCell(row, c)) {
      cells.push({ row, col: c });
      c++;
    }
  } else {
    let startRow = row;
    while (startRow > 0 && isWhiteCell(startRow - 1, col)) startRow--;

    let r = startRow;
    while (r < GRID_SIZE && isWhiteCell(r, col)) {
      cells.push({ row: r, col });
      r++;
    }
  }

  return cells.length >= 3 ? cells : [];
}

function nextCellInDirection(row: number, col: number, dir: Direction) {
  if (dir === 'across') {
    let c = col + 1;
    while (c < GRID_SIZE) {
      if (isWhiteCell(row, c)) return { row, col: c };
      c++;
    }
  } else {
    let r = row + 1;
    while (r < GRID_SIZE) {
      if (isWhiteCell(r, col)) return { row: r, col };
      r++;
    }
  }
  return null;
}

function prevCellInDirection(row: number, col: number, dir: Direction) {
  if (dir === 'across') {
    let c = col - 1;
    while (c >= 0) {
      if (isWhiteCell(row, c)) return { row, col: c };
      c--;
    }
  } else {
    let r = row - 1;
    while (r >= 0) {
      if (isWhiteCell(r, col)) return { row: r, col };
      r--;
    }
  }
  return null;
}

function hasWordInDirection(row: number, col: number, dir: Direction) {
  return getWordCells(row, col, dir).length >= 3;
}
function getWordNumber(row: number, col: number): number | null {
  const key = `${row},${col}`;
  return WORD_NUMBERS[key] ?? null;
}
function getWordKeyCells(wordKey: string) {
  const pos = WORD_POSITIONS[wordKey];
  if (!pos) return new Set<string>();

  const set = new Set<string>();
  for (let i = 0; i < pos.length; i++) {
    set.add(`${pos.row},${pos.startCol + i}`);
  }

  return set;
}
function extractWord(cells: CellCoord[], grid: string[][]) {
  return cells.map(c => grid[c.row]?.[c.col] ?? '').join('');
}

function getWordKey(firstCell: CellCoord, dir: Direction) {
  const num = getWordNumber(firstCell.row, firstCell.col);
  if (num === null) return null;
  return `${num}_${dir}`;
}
function generateWordNumbers() {
  const numbers: Record<string, number> = {};
  let num = 1;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {

      if (isBlackCell(row, col)) continue;

      const startAcross =
        (col === 0 || isBlackCell(row, col - 1)) &&
        col + 1 < GRID_SIZE &&
        !isBlackCell(row, col + 1);

      const startDown =
        (row === 0 || isBlackCell(row - 1, col)) &&
        row + 1 < GRID_SIZE &&
        !isBlackCell(row + 1, col);

      if (startAcross || startDown) {
        numbers[`${row},${col}`] = num;
        num++;
      }
    }
  }

  return numbers;
}

const WORD_NUMBERS = generateWordNumbers();

  // ── State ──────────────────────────────────────────────────────────────────

  const [letterGrid, setLetterGrid] = useState<string[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  );
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [puzzleFinished, setPuzzleFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false)
  const [activeCell, setActiveCell] = useState<CellCoord | null>(null);
  const [direction, setDirection] = useState<Direction>('across');
  useEffect(() => {

    if (!activeCell) return;
  
    const { row, col } = activeCell;
  
    setTimeout(() => {
      inputRefs.current[row][col]?.focus();
    }, 0);
  
  }, [activeCell]);

  
  // ── Refs ───────────────────────────────────────────────────────────────────

  const inputRefs = useRef<Array<Array<TextInput | null>>>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );
  const clueScrollRef = useRef<ScrollView | null>(null);

  // Track which words have had onWordComplete fired to avoid duplicates
  const reportedWords = useRef<Set<string>>(new Set());

  // ── Computed: cell sets for coloring ──────────────────────────────────────

  const completedCells: Set<string> = React.useMemo(() => {
    const set = new Set<string>();
    for (const wk of completedWords) {
      getWordKeyCells(wk).forEach((c) => set.add(c));
    }
    return set;
  }, [completedWords]);

  const opponentCells: Set<string> = React.useMemo(() => {
    const set = new Set<string>();
    const allKeys = Object.keys(puzzleData.answers || {});
    for (const idx of opponentWords) {
      const wk = allKeys[idx];
      if (!wk) continue;
      // Don't overlay on already-completed (my) cells
      if (!completedWords.includes(wk)) {
        getWordKeyCells(wk).forEach((c) => set.add(c));
      }
    }
    return set;
  }, [opponentWords, completedWords]);

  const activeWordCells: Set<string> = React.useMemo(() => {
    if (!activeCell) return new Set<string>();
    const cells = getWordCells(activeCell.row, activeCell.col, direction);
    const set = new Set<string>();
    cells.forEach((c) => set.add(`${c.row},${c.col}`));
    return set;
  }, [activeCell, direction]);

  // ── Focus Management ────────────────────────────────────────────────────────

  const focusCell = useCallback((row: number, col: number) => {
    const ref = inputRefs.current[row]?.[col];
    if (ref) ref.focus();
  }, []);

  useEffect(() => {
    if (activeCell) focusCell(activeCell.row, activeCell.col);
  }, [activeCell, focusCell]);

  // ── Word completion detection ──────────────────────────────────────────────

  const checkWordCompletion = useCallback(
    (row: number, col: number, dir: Direction, grid: string[][]) => {
      const wordCells = getWordCells(row, col, dir);
      if (wordCells.length === 0) return;

      const firstCell = wordCells[0];
      if (!firstCell) return;
      const wordKey = getWordKey(firstCell, dir);
      if (!wordKey) return;

      // Skip if already reported or already completed from server
      if (reportedWords.current.has(wordKey)) return;

      // Check all cells are filled
      const allFilled = wordCells.every((c) => {
        const letter = grid[c.row]?.[c.col] ?? '';
        return letter.length > 0;
      });

      if (allFilled) {
        const answer = extractWord(wordCells, grid);
        console.log("WORD KEY:", wordKey);
  console.log("TYPED:", answer);
  console.log("EXPECTED:", puzzleData.answers?.[wordKey]);
const correct = puzzleData.answers?.[wordKey];
const pos = WORD_POSITIONS[wordKey];
if (!pos) return;
if (wordCells.length !== pos.length) return;

if (correct && answer === correct) {
  console.log("CORRECT WORD:", wordKey);

  setCorrectWords(prev => {

    // prevent duplicates
    if (prev.includes(wordKey)) return prev;

    const updated = [...prev, wordKey];

    const allAnswers = Object.keys(puzzleData.answers || {});

    if (!gameOver && allAnswers.every(w => updated.includes(w))) {

      console.log("PUZZLE COMPLETED");

      setPuzzleFinished(true);
      setGameOver(true);
      setActiveCell(null);

    }

    return updated;

  });

  reportedWords.current.add(wordKey);

  if (onWordComplete) {
    // Extract numeric wordIndex from key like "5_across" → 4 (0-based)
    const allKeys = Object.keys(puzzleData.answers || {});
    const idx = allKeys.indexOf(wordKey);
    onWordComplete(idx >= 0 ? idx : 0, answer);
  }

}
      }
    },
    [onWordComplete, completedWords, correctWords]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (isBlackCell(row, col)) return;

      if (activeCell && activeCell.row === row && activeCell.col === col) {
        const newDir: Direction = direction === 'across' ? 'down' : 'across';
        if (hasWordInDirection(row, col, newDir)) setDirection(newDir);
      } else {
        let newDir = direction;
        if (!hasWordInDirection(row, col, direction)) {
          const other: Direction = direction === 'across' ? 'down' : 'across';
          if (hasWordInDirection(row, col, other)) newDir = other;
        }
        setActiveCell({ row, col });
        setDirection(newDir);
      }

      focusCell(row, col);
    },
    [activeCell, direction, focusCell]
  );

  const handleChangeText = useCallback(
    (row: number, col: number, text: string) => {
  
      if (gameOver) return;
  
      const letter = text.slice(-1).toUpperCase();
      const key = `${row},${col}`;
  
      if (isCellInCorrectWord(row, col)) return;
      if (completedCells.has(key)) return;
  
      let nextGrid: string[][] = [];
  
      setLetterGrid((prev) => {
  
        nextGrid = prev.map((r) => [...r]);
        nextGrid[row][col] = letter;
  
        return nextGrid;
  
      });
  
      if (letter) {
        checkWordCompletion(row, col, direction, nextGrid);
      }
  
      const nextCell = nextCellInDirection(row, col, direction);
  
      if (nextCell) {
        setTimeout(() => {
          setActiveCell(nextCell);
          inputRefs.current[nextCell.row][nextCell.col]?.focus();
        }, 0);
      }
  
    },
    [direction, gameOver]
  );

  const handleKeyPress = useCallback(
    (row: number, col: number, key: string) => {
      if (key === 'Backspace') {
        const currentLetter = letterGrid[row][col];
        if (currentLetter) {
          setLetterGrid((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = '';
            return next;
          });
        } else {
          const prev = prevCellInDirection(row, col, direction);
          if (prev) {
            setLetterGrid((prevGrid) => {
              const next = prevGrid.map((r) => [...r]);
              next[prev.row][prev.col] = '';
              return next;
            });
            setActiveCell(prev);
          }
        }
      }
    },
    [direction, letterGrid]
  );

  const handleDirectionToggle = useCallback(
    (dir: Direction) => {
      setDirection(dir);
    },
    []
  );
  function jumpToClue(wordKey: string) {

    const pos = WORD_POSITIONS[wordKey];
  
    if (pos) {
      setActiveCell({
        row: pos.row,
        col: pos.startCol
      });
    } else {
      // handle DOWN clues by scanning grid
      const number = wordKey.split("_")[0];
  
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
  
          const n = getWordNumber(row, col);
          if (n && n.toString() === number) {
  
            setActiveCell({ row, col });
            break;
  
          }
        }
      }
    }
  
    if (wordKey.includes("_down")) {
      setDirection("down");
    } else {
      setDirection("across");
    }
    clueScrollRef.current?.scrollTo({ y: 0, animated: true });
  }
  // ── Clue display ───────────────────────────────────────────────────────────

  const activeClue = React.useMemo(() => {
    if (!activeCell) return 'Select a cell to see the clue';
    const wordCells = getWordCells(activeCell.row, activeCell.col, direction);
    if (wordCells.length === 0) return 'No word in this direction';
    const firstCell = wordCells[0];
    if (!firstCell) return 'No word in this direction';
    const num = getWordNumber(firstCell.row, firstCell.col);
    if (num === null) return 'No word in this direction';
    const wordKey = `${num}_${direction}`;
    const clueText = clues[wordKey];
    if (clueText) return `${num}. ${clueText}`;
    return `${num}. Clue goes here`;
  }, [activeCell, direction, clues]);
  useEffect(() => {
    if (!clueScrollRef.current) return;
  
    clueScrollRef.current.scrollTo({
      y: 0,
      animated: true
    });
  
  }, [activeClue]);
  function isPuzzleComplete() {

    const allAnswers = Object.keys(puzzleData.answers || {});
  
    return allAnswers.every((wordKey) => correctWords.includes(wordKey));
  
  }
  const activeWordInfo = React.useMemo(() => {
    if (!activeCell) return null;
    const wordCells = getWordCells(activeCell.row, activeCell.col, direction);
    if (wordCells.length === 0) return null;
    const firstCell = wordCells[0];
    if (!firstCell) return null;
    const num = getWordNumber(firstCell.row, firstCell.col);
    const dirLabel = direction === 'across' ? 'A' : 'D';
    return num !== null ? `${num}${dirLabel}  ·  ${wordCells.length} letters` : `${dirLabel}  ·  ${wordCells.length} letters`;
  }, [activeCell, direction]);
  const totalWords = Object.keys(puzzleData.answers || {}).length;
const solvedWords = correctWords.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  function isCellInCorrectWord(row: number, col: number) {
    return correctWords.some((wordKey) => {
      const pos = WORD_POSITIONS[wordKey];
      if (!pos) return false;
  
      for (let i = 0; i < pos.length; i++) {
        if (row === pos.row && col === pos.startCol + i) {
          return true;
        }
      }
  
      return false;
    });
  }
  const renderCell = (row: number, col: number) => {
    const key = `${row},${col}`;
    const isBlack = isBlackCell(row, col);
    const isActive = activeCell?.row === row && activeCell?.col === col;
    const isInWord = activeWordCells.has(key);
    const isCompleted = completedCells.has(key);
    const isOpponent = opponentCells.has(key);
    const wordNumber = getWordNumber(row, col);
    const letter = letterGrid[row][col];

    if (isBlack) {
      return (
        <View
          key={key}
          style={[styles.cellBlack, { width: CELL_SIZE, height: CELL_SIZE }]}
          testID={`cell-black-${key}`}
        />
      );
    }

    let cellBg = COLORS.cellWhite;
    const isCorrectCell = isCellInCorrectWord(row, col);
    let cellBorderColor = COLORS.border;
    let letterColor = COLORS.textDark;
    let numberColor = COLORS.textNumber;
    if (isCorrectCell) {
      cellBg = COLORS.cellCompleted;
      cellBorderColor = COLORS.cellCompletedBorder;
      letterColor = COLORS.cellCompletedText;
      numberColor = COLORS.textNumberOnDark;
    }
    else if (isCompleted) {
      cellBg = COLORS.cellCompleted;
      cellBorderColor = COLORS.cellCompletedBorder;
      letterColor = COLORS.cellCompletedText;
      numberColor = COLORS.textNumberOnDark;
    }
    else if (isOpponent) {
      cellBg = COLORS.cellOpponent;
      cellBorderColor = COLORS.cellOpponentBorder;
      letterColor = '#AACFFF';
      numberColor = '#6699CC';
    }
    else if (isActive) {
      cellBg = COLORS.cellActive;
    }
    else if (isInWord) {
      cellBg = COLORS.cellWordHighlight;
    }
    return (
      <Pressable
        key={key}
        onPress={() => handleCellPress(row, col)}
        style={[
          styles.cellWhite,
          { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: cellBg, borderColor: cellBorderColor }
        ]}
        testID={`cell-${key}`}
      >
        {wordNumber !== null ? (
          <Text style={[styles.cellNumber, { color: numberColor }]} testID={`cell-number-${key}`}>
            {wordNumber}
          </Text>
        ) : null}
        <TextInput
          ref={(ref) => {
            if (inputRefs.current[row]) inputRefs.current[row][col] = ref;
          }}
          style={styles.cellInput}
          value={letter}
          onChangeText={(text) => handleChangeText(row, col, text)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(row, col, nativeEvent.key)}
          maxLength={1}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          keyboardType="default"
          returnKeyType="next"
          selectTextOnFocus
          testID={`input-${key}`}
        />
        {letter ? (
          <Text style={[styles.cellLetter, { fontSize: CELL_SIZE * 0.45, color: letterColor }]} testID={`letter-${key}`}>
            {letter}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const renderRow = (rowIndex: number) => (
    <View key={`row-${rowIndex}`} style={styles.gridRow}>
      {Array.from({ length: GRID_SIZE }, (_, colIndex) => renderCell(rowIndex, colIndex))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header — only show in non-multiplayer mode */}
        {!isMultiplayer && (
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitleCross}>CROSS</Text>
              <Text style={styles.headerTitleDuel}> DUEL</Text>
            </View>
            <Text style={styles.headerSubtitle}>COMPETITIVE CROSSWORD</Text>
          </View>
        )}

        {/* Score bar — multiplayer only */}
        {isMultiplayer === true && (
          <View style={styles.scoreBar}>
            <View style={styles.scorePlayerSection}>
              <Text style={styles.scoreNameYou} numberOfLines={1}>{myName.toUpperCase()}</Text>
              <Text style={styles.scoreValueYou}>{myScore}</Text>
            </View>
            <View style={styles.scoreCenter}>
              <Text style={styles.scoreVs}>VS</Text>
            </View>
            <View style={[styles.scorePlayerSection, styles.scorePlayerSectionRight]}>
              <Text style={styles.scoreNameOpp} numberOfLines={1}>{opponentName.toUpperCase()}</Text>
              <Text style={styles.scoreValueOpp}>{opponentScore}</Text>
            </View>
          </View>
        )}

        {/* Direction Toggle */}
        <View style={styles.directionBar}>
          <Pressable
            onPress={() => handleDirectionToggle('across')}
            style={[styles.directionButton, direction === 'across' && styles.directionButtonActive]}
            testID="direction-across"
          >
            <Text style={[styles.directionButtonText, direction === 'across' && styles.directionButtonTextActive]}>
              ACROSS
            </Text>
          </Pressable>
          <View style={styles.directionDivider} />
          <Pressable
            onPress={() => handleDirectionToggle('down')}
            style={[styles.directionButton, direction === 'down' && styles.directionButtonActive]}
            testID="direction-down"
          >
            <Text style={[styles.directionButtonText, direction === 'down' && styles.directionButtonTextActive]}>
              DOWN
            </Text>
          </Pressable>
        </View>

        {/* Active word info */}
        <View style={styles.wordInfoBar}>
          {activeCell !== null ? (
            <Text style={styles.wordInfoText} numberOfLines={1}>
              {activeWordInfo ?? '—'}
            </Text>
          ) : (
            <Text style={styles.wordInfoTextMuted}>Tap a cell to begin</Text>
          )}
        </View>

        {/* Grid */}
        <View style={styles.gridWrapper}>
          <View style={styles.gridContainer}>
            <View style={styles.grid} testID="crossword-grid">
              {Array.from({ length: GRID_SIZE }, (_, rowIndex) => renderRow(rowIndex))}
            </View>
          </View>
        </View>
        <View style={{
  marginTop: 10,
  paddingVertical: 6,
  paddingHorizontal: 12,
  backgroundColor: "#111",
  borderRadius: 6
}}>
  <Text style={{
    color: "#F5E642",
    fontWeight: "600",
    letterSpacing: 1
  }}>
    Puzzle {puzzleIndex + 1} / {puzzles.length}   •   Progress {correctWords.length} / {Object.keys(puzzleData.answers || {}).length}
  </Text>
</View>
        {puzzleFinished && (
  <View style={{
    position: "absolute",
    top: "35%",
    alignSelf: "center",
    backgroundColor: "#000000DD",
    padding: 28,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 260
  }}>
    <Text style={{
      fontSize: 24,
      fontWeight: "bold",
      color: "#F5E642",
      marginBottom: 10
    }}>
      🏆 PUZZLE COMPLETED
    </Text>

    <Text style={{ color: "white" }}>
      Great job!
    </Text>
    <Pressable
  style={{
    marginTop: 12,
    backgroundColor: "#F5E642",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4
  }}
  onPress={() => {

    const nextIndex = (puzzleIndex + 1) % puzzles.length;
    const nextPuzzle = puzzles[nextIndex];

    setPuzzleIndex(nextIndex);

    setLetterGrid(
      Array.from({ length: nextPuzzle.gridSize }, () =>
        Array(nextPuzzle.gridSize).fill('')
      )
    );

    setCorrectWords([]);
    setActiveCell(null);
    setDirection("across");
    setPuzzleFinished(false);

    reportedWords.current.clear();

  }}
>
  <Text style={{ fontWeight: "bold", color: "#000" }}>
    Next Puzzle
  </Text>
</Pressable>
  </View>
)}


        {/* Clue area */}
<ScrollView
  ref={clueScrollRef}
  style={styles.clueArea}
>

  <Text style={styles.clueLabel}>ACROSS</Text>

  {Object.entries(puzzleData.clues || {})
    .filter(([key]) => key.includes("_across"))
    .map(([key, clue]) => {

      const number = key.split("_")[0];

      return (
        <Pressable key={key} onPress={() => jumpToClue(key)}>
          <Text
            style={[
              styles.clueText,
              activeClue.startsWith(number + ".") && { color: COLORS.accent }
            ]}
          >
            {number}. {clue as string}
          </Text>
        </Pressable>
      );
    })}

  <Text style={[styles.clueLabel, { marginTop: 16 }]}>DOWN</Text>

  {Object.entries(puzzleData.clues || {})
    .filter(([key]) => key.includes("_down"))
    .map(([key, clue]) => {

      const number = key.split("_")[0];

      return (
        <Pressable key={key} onPress={() => jumpToClue(key)}>
          <Text
            style={[
              styles.clueText,
              activeClue.startsWith(number + ".") && { color: COLORS.accent }
            ]}
          >
            {number}. {clue as string}
          </Text>
        </Pressable>
      );
    })}

</ScrollView>


        {/* Legend for multiplayer */}
        {isMultiplayer === true && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cellCompleted }]} />
              <Text style={styles.legendText}>YOUR WORDS</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.cellOpponent }]} />
              <Text style={styles.legendText}>OPPONENT</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  headerTitleCross: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textOnDark,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  headerTitleDuel: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Score Bar ─────────────────────────────────────────────────────────────
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.scoreBarBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.scoreBarBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
  },
  scorePlayerSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  scorePlayerSectionRight: {
    alignItems: 'flex-end',
  },
  scoreNameYou: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreValueYou: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreCenter: {
    paddingHorizontal: 12,
  },
  scoreVs: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreNameOpp: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  scoreValueOpp: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3B82F6',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Direction Bar ─────────────────────────────────────────────────────────
  directionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.buttonBg,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  directionButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  directionButtonActive: {
    backgroundColor: COLORS.accent,
  },
  directionButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.buttonText,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  directionButtonTextActive: {
    color: COLORS.buttonActiveText,
  },
  directionDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },

  // ── Word Info Bar ─────────────────────────────────────────────────────────
  wordInfoBar: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 12,
  },
  wordInfoText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  wordInfoTextMuted: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textMuted,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  gridWrapper: {
    alignSelf: 'center',
  },
  gridContainer: {
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: 12,
  },
  grid: {
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
  },

  // ── Cells ─────────────────────────────────────────────────────────────────
  cellBlack: {
    backgroundColor: COLORS.cellBlack,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  cellWhite: {
    backgroundColor: COLORS.cellWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 7,
    fontWeight: '600',
    color: COLORS.textNumber,
    lineHeight: 9,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
    zIndex: 2,
  },
  cellInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: 1,
  },
  cellLetter: {
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
    zIndex: 2,
  },

  // ── Clue Area ─────────────────────────────────────────────────────────────
  clueArea: {
    marginTop: 8,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
    borderRadius: 10,
    width: '95%',
    maxWidth: '95%',
  },
  clueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
  clueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F5F5F0',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    paddingVertical: 2,
  },

  // ── Legend ────────────────────────────────────────────────────────────────
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
});
