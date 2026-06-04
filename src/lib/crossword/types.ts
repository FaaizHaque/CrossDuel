export type Direction = 'across' | 'down';

export interface PuzzleWord {
  id: string;
  number: number;
  direction: Direction;
  row: number;
  col: number;
  length: number;
  answer: string;
  clue: string;
}

export interface PuzzleDef {
  id: string;
  title: string;
  gridSize: number;
  words: PuzzleWord[];
}

export interface Cell {
  row: number;
  col: number;
  isBlack: boolean;
  answer: string;
  letter: string;
  number?: number;
  acrossWordId?: string;
  downWordId?: string;
}

export interface SolvedWord {
  id: string;
  isCorrect: boolean;
  isFilled: boolean;
}

export interface CrosswordState {
  puzzle: PuzzleDef;
  gridSize: number;
  cells: Cell[][];
  solvedWords: Record<string, SolvedWord>;
  selectedCell: [number, number] | null;
  selectedWordId: string | null;
  direction: Direction;
  isComplete: boolean;
  correctCount: number;
  totalWords: number;
}
