/**
 * Daily puzzle — 9×9 space / science theme
 *
 * Black cell pattern (same as puzzle1):
 *   col4 blocked for rows 0-2
 *   col0 + col8 blocked for rows 3-5
 *   col4 blocked for rows 6-8
 *
 * Grid layout (■ = black):
 *
 *      0    1    2    3    4    5    6    7    8
 *  0 [ S ][ T ][ A ][ R ][ ■ ][ N ][ O ][ V ][ A ]   1A=STAR, 5A=NOVA
 *  1 [ U ][ R ][ E ][ A ][ ■ ][ R ][ A ][ Y ][ S ]   9A=UREA, 10A=RAYS
 *  2 [ N ][ E ][ O ][ N ][ ■ ][ L ][ E ][ N ][ S ]   11A=NEON, 12A=LENS
 *  3 [ ■ ][ P ][ L ][ A ][ N ][ E ][ T ][ S ][ ■ ]   13A=PLANETS
 *  4 [ ■ ][ M ][ E ][ T ][ E ][ O ][ R ][ S ][ ■ ]   15A=METEORS
 *  5 [ ■ ][ N ][ E ][ U ][ T ][ R ][ O ][ N ][ ■ ]   16A=NEUTRON
 *  6 [ M ][ A ][ S ][ S ][ ■ ][ I ][ O ][ N ][ S ]   17A=MASS,  18A=IONS
 *  7 [ D ][ A ][ R ][ K ][ ■ ][ L ][ U ][ N ][ A ]   20A=DARK,  21A=LUNA
 *  8 [ M ][ A ][ R ][ S ][ ■ ][ E ][ R ][ O ][ S ]   22A=MARS,  23A=EROS
 *
 * Verified down words:
 *  col0 r0-2: S,U,N = SUN  (1D)
 *  col3 r0-2: R,A,N = RAN  (4D)
 *  col4 r3-5: N,E,T = NET  (14D)
 */

export interface PuzzleDefinition {
  gridSize: number;
  blackCells: string[];
  acrossWords: {
    [id: string]: {
      row: number;
      startCol: number;
      length: number;
      clue: string;
      answer: string;
      number: number;
    };
  };
  downWords: {
    [id: string]: {
      col: number;
      startRow: number;
      length: number;
      clue: string;
      answer: string;
      number: number;
    };
  };
}

export const dailyPuzzle: PuzzleDefinition = {
  gridSize: 9,

  blackCells: [
    '0,4', '1,4', '2,4',
    '3,0', '3,8',
    '4,0', '4,8',
    '5,0', '5,8',
    '6,4', '7,4', '8,4',
  ],

  acrossWords: {
    '1_across':  { number: 1,  row: 0, startCol: 0, length: 4, answer: 'STAR',    clue: 'Luminous ball of plasma lighting the sky' },
    '5_across':  { number: 5,  row: 0, startCol: 5, length: 4, answer: 'NOVA',    clue: 'Sudden dramatic brightening of a star' },
    '9_across':  { number: 9,  row: 1, startCol: 0, length: 4, answer: 'UREA',    clue: 'Nitrogen compound; found in fertilizers and urine' },
    '10_across': { number: 10, row: 1, startCol: 5, length: 4, answer: 'RAYS',    clue: 'Beams of light or radiation from the sun' },
    '11_across': { number: 11, row: 2, startCol: 0, length: 4, answer: 'NEON',    clue: 'Noble gas, element 10; glows orange-red in signs' },
    '12_across': { number: 12, row: 2, startCol: 5, length: 4, answer: 'LENS',    clue: 'Curved glass that focuses light in a telescope' },
    '13_across': { number: 13, row: 3, startCol: 1, length: 7, answer: 'PLANETS', clue: 'Eight bodies orbit our sun; Earth is the third' },
    '15_across': { number: 15, row: 4, startCol: 1, length: 7, answer: 'METEORS', clue: 'Space rocks that streak across the sky as shooting stars' },
    '16_across': { number: 16, row: 5, startCol: 1, length: 7, answer: 'NEUTRON', clue: 'Uncharged subatomic particle found in the nucleus' },
    '17_across': { number: 17, row: 6, startCol: 0, length: 4, answer: 'MASS',    clue: 'Amount of matter; measured in kilograms' },
    '18_across': { number: 18, row: 6, startCol: 5, length: 4, answer: 'IONS',    clue: 'Charged atoms used in ion-drive spacecraft engines' },
    '20_across': { number: 20, row: 7, startCol: 0, length: 4, answer: 'DARK',    clue: '___ matter: invisible substance comprising 27% of the universe' },
    '21_across': { number: 21, row: 7, startCol: 5, length: 4, answer: 'LUNA',    clue: "Latin name for Earth's natural satellite" },
    '22_across': { number: 22, row: 8, startCol: 0, length: 4, answer: 'MARS',    clue: 'Fourth planet from the sun; the Red Planet' },
    '23_across': { number: 23, row: 8, startCol: 5, length: 4, answer: 'EROS',    clue: 'Near-Earth asteroid; first to be orbited by a spacecraft' },
  },

  downWords: {
    '1_down':  { number: 1,  col: 0, startRow: 0, length: 3, answer: 'SUN', clue: 'Our nearest star; center of the solar system' },
    '4_down':  { number: 4,  col: 3, startRow: 0, length: 3, answer: 'RAN', clue: 'Moved quickly (past tense of run)' },
    '14_down': { number: 14, col: 4, startRow: 3, length: 3, answer: 'NET', clue: 'Remaining after deductions; also a mesh structure' },
  },
};
