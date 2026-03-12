// The default puzzle for Cross Duel
// Grid is 9x9 with black cells at specific positions

export interface PuzzleData {
  title: string;
  answers: Record<string, string>; // "1_across" -> "EPIC"
  clues: Record<string, string>; // "1_across" -> "clue text"
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
    "20_across": "FIRE",
    "21_across": "WORD",
    "22_across": "ACED",
    "23_across": "STAR",
  },
  clues: {
    "1_across": "Legendary and grand",
    "5_across": "Daring and fearless",
    "9_across": "The very highest point",
    "10_across": "Soft radiant light",
    "11_across": "Strong metallic element",
    "12_across": "A specific area or region",
    "13_across": "A great victory",
    "15_across": "Those with expert skills",
    "16_across": "When one body blocks another's light",
    "17_across": "A competitive activity",
    "18_across": "A one-on-one contest",
    "20_across": "Passionate energy or flames",
    "21_across": "A unit of language",
    "22_across": "Scored perfectly on a test",
    "23_across": "A celestial body that shines",
  },
};
