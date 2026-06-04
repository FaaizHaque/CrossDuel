import { Cell, CrosswordState, Direction, PuzzleDef, PuzzleWord, SolvedWord } from './types';

function makeBlackCell(row: number, col: number): Cell {
  return { row, col, isBlack: true, answer: '', letter: '', number: undefined, acrossWordId: undefined, downWordId: undefined };
}

function makeWhiteCell(row: number, col: number): Cell {
  return { row, col, isBlack: false, answer: '', letter: '', number: undefined, acrossWordId: undefined, downWordId: undefined };
}

export function buildCrossword(puzzle: PuzzleDef): CrosswordState {
  const { gridSize, words } = puzzle;

  // Init all black
  const cells: Cell[][] = [];
  for (let r = 0; r < gridSize; r++) {
    cells[r] = [];
    for (let c = 0; c < gridSize; c++) {
      cells[r][c] = makeBlackCell(r, c);
    }
  }

  // Mark white cells and set answers
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      if (cells[r][c].isBlack) {
        cells[r][c] = makeWhiteCell(r, c);
      }
      cells[r][c].answer = word.answer[i].toUpperCase();
      if (word.direction === 'across') {
        cells[r][c].acrossWordId = word.id;
      } else {
        cells[r][c].downWordId = word.id;
      }
    }
    // Set clue number on starting cell
    cells[word.row][word.col].number = word.number;
  }

  // Build solvedWords map
  const solvedWords: Record<string, SolvedWord> = {};
  for (const word of words) {
    solvedWords[word.id] = { id: word.id, isCorrect: false, isFilled: false };
  }

  return {
    puzzle,
    gridSize,
    cells,
    solvedWords,
    selectedCell: null,
    selectedWordId: null,
    direction: 'across',
    isComplete: false,
    correctCount: 0,
    totalWords: words.length,
  };
}

function validateWord(word: PuzzleWord, cells: Cell[][]): SolvedWord {
  let isCorrect = true;
  let isFilled = true;
  for (let i = 0; i < word.length; i++) {
    const r = word.direction === 'across' ? word.row : word.row + i;
    const c = word.direction === 'across' ? word.col + i : word.col;
    const cell = cells[r][c];
    if (!cell.letter) {
      isFilled = false;
      isCorrect = false;
    } else if (cell.letter.toUpperCase() !== cell.answer.toUpperCase()) {
      isCorrect = false;
    }
  }
  return { id: word.id, isCorrect, isFilled };
}

function revalidate(state: CrosswordState): CrosswordState {
  const newSolvedWords: Record<string, SolvedWord> = {};
  for (const word of state.puzzle.words) {
    newSolvedWords[word.id] = validateWord(word, state.cells);
  }
  const correctCount = Object.values(newSolvedWords).filter(w => w.isCorrect).length;
  const isComplete = correctCount === state.totalWords;
  return { ...state, solvedWords: newSolvedWords, correctCount, isComplete };
}

function findWordForCell(state: CrosswordState, row: number, col: number, direction: Direction): string | null {
  const cell = state.cells[row]?.[col];
  if (!cell || cell.isBlack) return null;
  if (direction === 'across') return cell.acrossWordId ?? null;
  return cell.downWordId ?? null;
}

export function selectCell(state: CrosswordState, row: number, col: number): CrosswordState {
  const cell = state.cells[row]?.[col];
  if (!cell || cell.isBlack) return state;

  const isSameCell = state.selectedCell?.[0] === row && state.selectedCell?.[1] === col;

  let newDirection = state.direction;

  if (isSameCell) {
    // Toggle direction if cell belongs to both
    const hasAcross = !!cell.acrossWordId;
    const hasDown = !!cell.downWordId;
    if (hasAcross && hasDown) {
      newDirection = state.direction === 'across' ? 'down' : 'across';
    }
  } else {
    // If no word in current direction, switch
    const wordInDir = findWordForCell(state, row, col, newDirection);
    if (!wordInDir) {
      newDirection = newDirection === 'across' ? 'down' : 'across';
    }
  }

  const selectedWordId = findWordForCell(state, row, col, newDirection);

  return {
    ...state,
    selectedCell: [row, col],
    selectedWordId,
    direction: newDirection,
  };
}

export function enterLetter(state: CrosswordState, row: number, col: number, letter: string): CrosswordState {
  const cell = state.cells[row]?.[col];
  if (!cell || cell.isBlack) return state;

  const newCells = state.cells.map(rowArr =>
    rowArr.map(c => {
      if (c.row === row && c.col === col) {
        return { ...c, letter: letter.toUpperCase() };
      }
      return c;
    })
  );

  return revalidate({ ...state, cells: newCells });
}

export function clearCell(state: CrosswordState, row: number, col: number): CrosswordState {
  const cell = state.cells[row]?.[col];
  if (!cell || cell.isBlack) return state;

  const newCells = state.cells.map(rowArr =>
    rowArr.map(c => {
      if (c.row === row && c.col === col) {
        return { ...c, letter: '' };
      }
      return c;
    })
  );

  return revalidate({ ...state, cells: newCells });
}

export function getNextCell(state: CrosswordState): [number, number] | null {
  if (!state.selectedCell || !state.selectedWordId) return null;
  const [selRow, selCol] = state.selectedCell;

  const word = state.puzzle.words.find(w => w.id === state.selectedWordId);
  if (!word) return null;

  const cells: Array<[number, number]> = [];
  for (let i = 0; i < word.length; i++) {
    const r = word.direction === 'across' ? word.row : word.row + i;
    const c = word.direction === 'across' ? word.col + i : word.col;
    cells.push([r, c]);
  }

  const currentIdx = cells.findIndex(([r, c]) => r === selRow && c === selCol);
  if (currentIdx === -1) return null;

  // Look for next empty cell after current
  for (let i = currentIdx + 1; i < cells.length; i++) {
    const [r, c] = cells[i];
    if (!state.cells[r][c].letter) return [r, c];
  }
  // If no empty, return next cell (wrap to end)
  if (currentIdx + 1 < cells.length) {
    return cells[currentIdx + 1];
  }
  return null;
}

export function getPrevCell(state: CrosswordState): [number, number] | null {
  if (!state.selectedCell || !state.selectedWordId) return null;
  const [selRow, selCol] = state.selectedCell;

  const word = state.puzzle.words.find(w => w.id === state.selectedWordId);
  if (!word) return null;

  const cells: Array<[number, number]> = [];
  for (let i = 0; i < word.length; i++) {
    const r = word.direction === 'across' ? word.row : word.row + i;
    const c = word.direction === 'across' ? word.col + i : word.col;
    cells.push([r, c]);
  }

  const currentIdx = cells.findIndex(([r, c]) => r === selRow && c === selCol);
  if (currentIdx <= 0) return null;
  return cells[currentIdx - 1];
}
