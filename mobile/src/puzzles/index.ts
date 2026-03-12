export const puzzles = [
  {
    gridSize: 9,

    blackCells: [
      "0,4","1,4","2,4",
      "3,0","3,8",
      "4,0","4,8",
      "5,0","5,8",
      "6,4","7,4","8,4"
    ],

    wordPositions: {
      "1_across": { row:0, startCol:0, length:4 },
      "5_across": { row:0, startCol:5, length:4 },

      "9_across": { row:1, startCol:0, length:4 },
      "10_across": { row:1, startCol:5, length:4 },

      "11_across": { row:2, startCol:0, length:4 },
      "12_across": { row:2, startCol:5, length:4 },

      "13_across": { row:3, startCol:1, length:7 },
      "15_across": { row:4, startCol:1, length:7 },
      "16_across": { row:5, startCol:1, length:7 },

      "17_across": { row:6, startCol:0, length:4 },
      "18_across": { row:6, startCol:5, length:4 },

      "20_across": { row:7, startCol:0, length:4 },
      "21_across": { row:7, startCol:5, length:4 },

      "22_across": { row:8, startCol:0, length:4 },
      "23_across": { row:8, startCol:5, length:4 }
    },

    clues: {
      "1_across": "Across clue 1",
      "5_across": "Across clue 5",
      "9_across": "Across clue 9",
      "10_across": "Across clue 10",
      "11_across": "Across clue 11",
      "12_across": "Across clue 12",
      "13_across": "Across clue 13",
      "15_across": "Across clue 15",
      "16_across": "Across clue 16",
      "17_across": "Across clue 17",
      "18_across": "Across clue 18",
      "20_across": "Across clue 20",
      "21_across": "Across clue 21",
      "22_across": "Across clue 22",
      "23_across": "Across clue 23"
    },

    answers: {
      "1_across": "BEAM",
      "5_across": "BARE"
    }

  }
];