export const puzzle2 = {
    gridSize: 9,
  
    blackCells: [
      '0,3','0,5',
      '1,3','1,5',
      '2,3','2,5',
      '3,0','3,8',
      '5,0','5,8',
      '6,3','6,5',
      '7,3','7,5',
      '8,3','8,5'
    ],
  
    wordPositions: {
      "1_across": { row:0, startCol:0, length:3 },
      "4_across": { row:0, startCol:4, length:1 },
      "5_across": { row:0, startCol:6, length:3 }
    },
  
    clues: {
      "1_across": "Opposite of off",
      "4_across": "Roman numeral for 1",
      "5_across": "Frozen water"
    },
  
    answers: {
      "1_across": "ONN",
      "4_across": "I",
      "5_across": "ICE"
    }
  };