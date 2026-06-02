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

export interface PuzzleData {
  title: string;
  answers: Record<string, string>;
  clues: Record<string, string>;
}

// Word keys match the mobile's generateWordNumbers() output based on the 9x9 grid layout.
// Black cells: col 4 in rows 0-5; cols 7-8 in rows 6-8; col 4 in row 6 starts a down-only #20.
export const DEFAULT_PUZZLE: PuzzleData = {
  title: "Cross Duel #1",
  answers: {
    "1_across":  "EPIC",
    "5_across":  "GAME",
    "9_across":  "BOLD",
    "10_across": "STAR",
    "11_across": "APEX",
    "12_across": "DUEL",
    "13_across": "GLOW",
    "14_across": "ACED",
    "15_across": "IRON",
    "16_across": "FIRE",
    "17_across": "ZONE",
    "18_across": "WORD",
    "19_across": "TRIUMPH",
    "21_across": "MASTERS",
    "22_across": "ECLIPSE",
  },
  clues: {
    "1_across":  "Legendary, awe-inspiring",
    "5_across":  "A competitive activity",
    "9_across":  "Daring and fearless",
    "10_across": "A luminous celestial body",
    "11_across": "The highest point",
    "12_across": "A contest between two",
    "13_across": "Emit a soft light",
    "14_across": "Performed perfectly",
    "15_across": "Strong metal element",
    "16_across": "Intense heat and flame",
    "17_across": "Designated area",
    "18_across": "A unit of language",
    "19_across": "A great victory",
    "21_across": "Champions of their craft",
    "22_across": "To surpass or overshadow",
  },
};
