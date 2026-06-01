// The default puzzle for Cross Duel
// Grid is 9x9 with black cells at specific positions
//
// Layout:
// Row 0, cols 0-3: EPIC    Row 0, cols 5-8: GAME
// Row 1, cols 0-3: BOLD    Row 1, cols 5-8: STAR
// Row 2, cols 0-3: APEX    Row 2, cols 5-8: DUEL
// Row 3, cols 0-3: GLOW    Row 3, cols 5-8: ACED
// Row 4, cols 0-3: IRON    Row 4, cols 5-8: FIRE
// Row 5, cols 0-3: ZONE    Row 5, cols 5-8: WORD
// Row 6, cols 0-6: TRIUMPH
// Row 7, cols 0-6: MASTERS
// Row 8, cols 0-6: ECLIPSE

export interface PuzzleWord {
  key: string;
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: "across";
}

export interface PuzzleData {
  title: string;
  answers: Record<string, string>; // "1_across" -> "EPIC"
  clues: Record<string, string>; // "1_across" -> "clue text"
  words?: PuzzleWord[];
}

// Puzzle answers - each word key maps to its answer
// Only ACROSS words are used for scoring; per-word validation.
export const DEFAULT_PUZZLE: PuzzleData = {
  title: "Cross Duel #1",
  answers: {
    "1_across": "EPIC",
    "5_across": "BOLD",
    "9_across": "APEX",
    "10_across": "GLOW",
    "11_across": "IRON",
    "12_across": "ZONE",
    "13_across": "TRIUMPH",
    "15_across": "MASTERS",
    "16_across": "ECLIPSE",
    "17_across": "GAME",
    "18_across": "DUEL",
    "19_across": "FIRE",
    "20_across": "WORD",
    "21_across": "ACED",
    "22_across": "STAR",
  },
  clues: {
    "1_across": "Legendary, awe-inspiring",
    "5_across": "Daring and fearless",
    "9_across": "The highest point",
    "10_across": "Emit a soft light",
    "11_across": "Strong metal element",
    "12_across": "Designated area",
    "13_across": "A great victory",
    "15_across": "Champions of their craft",
    "16_across": "To surpass or overshadow",
    "17_across": "A competitive activity",
    "18_across": "A contest between two",
    "19_across": "Intense heat and flame",
    "20_across": "A unit of language",
    "21_across": "Performed perfectly",
    "22_across": "A luminous celestial body",
  },
  // Grid positions for each word (row, starting col, direction across)
  words: [
    { key: "1_across",  answer: "EPIC",    clue: "Legendary, awe-inspiring",        row: 0, col: 0, direction: "across" },
    { key: "5_across",  answer: "BOLD",    clue: "Daring and fearless",              row: 1, col: 0, direction: "across" },
    { key: "9_across",  answer: "APEX",    clue: "The highest point",               row: 2, col: 0, direction: "across" },
    { key: "10_across", answer: "GLOW",    clue: "Emit a soft light",               row: 3, col: 0, direction: "across" },
    { key: "11_across", answer: "IRON",    clue: "Strong metal element",            row: 4, col: 0, direction: "across" },
    { key: "12_across", answer: "ZONE",    clue: "Designated area",                 row: 5, col: 0, direction: "across" },
    { key: "13_across", answer: "TRIUMPH", clue: "A great victory",                 row: 6, col: 0, direction: "across" },
    { key: "15_across", answer: "MASTERS", clue: "Champions of their craft",        row: 7, col: 0, direction: "across" },
    { key: "16_across", answer: "ECLIPSE", clue: "To surpass or overshadow",        row: 8, col: 0, direction: "across" },
    { key: "17_across", answer: "GAME",    clue: "A competitive activity",          row: 0, col: 5, direction: "across" },
    { key: "22_across", answer: "STAR",    clue: "A luminous celestial body",       row: 1, col: 5, direction: "across" },
    { key: "18_across", answer: "DUEL",    clue: "A contest between two",           row: 2, col: 5, direction: "across" },
    { key: "21_across", answer: "ACED",    clue: "Performed perfectly",             row: 3, col: 5, direction: "across" },
    { key: "19_across", answer: "FIRE",    clue: "Intense heat and flame",          row: 4, col: 5, direction: "across" },
    { key: "20_across", answer: "WORD",    clue: "A unit of language",              row: 5, col: 5, direction: "across" },
  ],
};
