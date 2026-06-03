import { dailyPuzzle, PuzzleDefinition } from '../../puzzles/daily';

export type Direction = 'across' | 'down';

export interface Cell {
  row: number;
  col: number;
  isBlack: boolean;
  letter: string;
  answer: string;
  number?: number;
  wordIds: string[];
}

export interface Word {
  id: string;
  direction: Direction;
  number: number;
  row: number;
  col: number;
  length: number;
  clue: string;
  answer: string;
  cells: [number, number][];
  isComplete: boolean;
  isCorrect: boolean;
}

export interface CrosswordState {
  gridSize: number;
  cells: Cell[][];
  words: Word[];
  selectedCell: [number, number] | null;
  selectedWord: string | null;
  direction: Direction;
  isComplete: boolean;
  completionPercent: number;
}

export function buildCrossword(puzzle: PuzzleDefinition): CrosswordState {
  const size = puzzle.gridSize;
  const blackSet = new Set(puzzle.blackCells);

  // Initialize empty grid
  const cells: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    cells[r] = [];
    for (let c = 0; c < size; c++) {
      cells[r][c] = {
        row: r,
        col: c,
        isBlack: blackSet.has(`${r},${c}`),
        letter: '',
        answer: '',
        wordIds: [],
      };
    }
  }

  const words: Word[] = [];

  // Process across words
  for (const [id, def] of Object.entries(puzzle.acrossWords)) {
    const cellCoords: [number, number][] = [];
    for (let i = 0; i < def.length; i++) {
      const r = def.row;
      const c = def.startCol + i;
      cellCoords.push([r, c]);
      cells[r][c].answer = def.answer[i];
      cells[r][c].wordIds.push(id);
      if (i === 0) {
        cells[r][c].number = def.number;
      }
    }
    words.push({
      id,
      direction: 'across',
      number: def.number,
      row: def.row,
      col: def.startCol,
      length: def.length,
      clue: def.clue,
      answer: def.answer,
      cells: cellCoords,
      isComplete: false,
      isCorrect: false,
    });
  }

  // Process down words
  for (const [id, def] of Object.entries(puzzle.downWords)) {
    const cellCoords: [number, number][] = [];
    for (let i = 0; i < def.length; i++) {
      const r = def.startRow + i;
      const c = def.col;
      cellCoords.push([r, c]);
      // Down answer takes precedence only if cell not already set by across
      // Actually both should agree — set answer if not set yet
      if (!cells[r][c].answer) {
        cells[r][c].answer = def.answer[i];
      }
      if (!cells[r][c].wordIds.includes(id)) {
        cells[r][c].wordIds.push(id);
      }
      // Number cell — only set if not already numbered (across takes precedence by convention)
      if (i === 0 && !cells[r][c].number) {
        cells[r][c].number = def.number;
      }
    }
    words.push({
      id,
      direction: 'down',
      number: def.number,
      row: def.startRow,
      col: def.col,
      length: def.length,
      clue: def.clue,
      answer: def.answer,
      cells: cellCoords,
      isComplete: false,
      isCorrect: false,
    });
  }

  // Sort words: across first by number, then down by number
  words.sort((a, b) => {
    if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
    return a.number - b.number;
  });

  return {
    gridSize: size,
    cells,
    words,
    selectedCell: null,
    selectedWord: null,
    direction: 'across',
    isComplete: false,
    completionPercent: 0,
  };
}

function revalidateWords(cells: Cell[][], words: Word[]): Word[] {
  return words.map(word => {
    let filled = true;
    let correct = true;
    for (const [r, c] of word.cells) {
      const cell = cells[r][c];
      if (!cell.letter) filled = false;
      if (cell.letter !== cell.answer) correct = false;
    }
    return {
      ...word,
      isComplete: filled,
      isCorrect: filled && correct,
    };
  });
}

function calcCompletion(cells: Cell[][]): number {
  let total = 0;
  let filled = 0;
  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isBlack) {
        total++;
        if (cell.letter) filled++;
      }
    }
  }
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

function cloneCells(cells: Cell[][]): Cell[][] {
  return cells.map(row => row.map(cell => ({ ...cell, wordIds: [...cell.wordIds] })));
}

export function enterLetter(
  state: CrosswordState,
  row: number,
  col: number,
  letter: string
): CrosswordState {
  if (state.cells[row][col].isBlack) return state;
  const newCells = cloneCells(state.cells);
  newCells[row][col] = { ...newCells[row][col], letter: letter.toUpperCase() };
  const newWords = revalidateWords(newCells, state.words);
  const completionPercent = calcCompletion(newCells);
  const isComplete = newWords
    .filter(w => w.direction === 'across' || state.words.some(ww => ww.id === w.id && ww.direction === 'down'))
    .every(w => w.isCorrect);
  // isComplete = all non-black cells filled correctly
  const allCorrect = newCells.every(row =>
    row.every(cell => cell.isBlack || cell.letter === cell.answer)
  );
  return {
    ...state,
    cells: newCells,
    words: newWords,
    completionPercent,
    isComplete: allCorrect && completionPercent === 100,
  };
}

export function clearCell(
  state: CrosswordState,
  row: number,
  col: number
): CrosswordState {
  if (state.cells[row][col].isBlack) return state;
  const newCells = cloneCells(state.cells);
  newCells[row][col] = { ...newCells[row][col], letter: '' };
  const newWords = revalidateWords(newCells, state.words);
  return {
    ...state,
    cells: newCells,
    words: newWords,
    completionPercent: calcCompletion(newCells),
    isComplete: false,
  };
}

function findWordForCell(
  state: CrosswordState,
  row: number,
  col: number,
  direction: Direction
): string | null {
  const cell = state.cells[row][col];
  if (cell.isBlack) return null;
  for (const wordId of cell.wordIds) {
    const word = state.words.find(w => w.id === wordId);
    if (word && word.direction === direction) return wordId;
  }
  return null;
}

export function selectCell(
  state: CrosswordState,
  row: number,
  col: number
): CrosswordState {
  if (state.cells[row][col].isBlack) return state;

  let newDirection = state.direction;

  // If same cell tapped, toggle direction
  if (
    state.selectedCell &&
    state.selectedCell[0] === row &&
    state.selectedCell[1] === col
  ) {
    newDirection = state.direction === 'across' ? 'down' : 'across';
  }

  // Try to find a word in the desired direction; fall back to other direction
  let wordId = findWordForCell({ ...state, direction: newDirection }, row, col, newDirection);
  if (!wordId) {
    newDirection = newDirection === 'across' ? 'down' : 'across';
    wordId = findWordForCell({ ...state, direction: newDirection }, row, col, newDirection);
  }

  return {
    ...state,
    selectedCell: [row, col],
    selectedWord: wordId,
    direction: newDirection,
  };
}

export function getNextCell(
  state: CrosswordState,
  row: number,
  col: number
): [number, number] | null {
  if (!state.selectedWord) return null;
  const word = state.words.find(w => w.id === state.selectedWord);
  if (!word) return null;
  const idx = word.cells.findIndex(([r, c]) => r === row && c === col);
  if (idx === -1 || idx === word.cells.length - 1) return null;
  return word.cells[idx + 1];
}

export function getPrevCell(
  state: CrosswordState,
  row: number,
  col: number
): [number, number] | null {
  if (!state.selectedWord) return null;
  const word = state.words.find(w => w.id === state.selectedWord);
  if (!word) return null;
  const idx = word.cells.findIndex(([r, c]) => r === row && c === col);
  if (idx <= 0) return null;
  return word.cells[idx - 1];
}
