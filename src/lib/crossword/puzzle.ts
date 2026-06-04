import { PuzzleDef } from './types';

/**
 * Verified 9x9 Nature & Seasons crossword.
 *
 * Grid layout (■ = black cell):
 *      0    1    2    3    4    5    6    7    8
 * 0  [ ■ ][ ■ ][ ■ ][ R ][ A ][ I ][ N ][ ■ ][ ■ ]   1A: RAIN
 * 1  [ ■ ][ ■ ][ ■ ][ A ][ W ][ ■ ][ O ][ ■ ][ ■ ]
 * 2  [ S ][ P ][ R ][ I ][ N ][ G ][ U ][ ■ ][ ■ ]   4A: SPRING
 * 3  [ O ][ ■ ][ ■ ][ ■ ][ ■ ][ A ][ N ][ ■ ][ ■ ]
 * 4  [ L ][ E ][ A ][ F ][ ■ ][ S ][ N ][ O ][ W ]   6A: LEAF, 7A: SNOW
 * 5  [ ■ ][ ■ ][ ■ ][ ■ ][ ■ ][ ■ ][ O ][ R ][ O ]
 * 6  [ ■ ][ M ][ I ][ S ][ T ][ ■ ][ D ][ E ][ W ]   11A: MIST, 14A: DEW
 * 7  [ ■ ][ ■ ][ ■ ][ I ][ A ][ ■ ][ ■ ][ R ][ O ]
 * 8  [ ■ ][ F ][ E ][ R ][ N ][ ■ ][ O ][ A ][ K ]   17A: FERN, 18A: OAK
 *
 * Verified down words:
 *  1D  RAI   col=3 rows 0-2: R(0,3)A(1,3)I(2,3)  -- I matches SPRING[3]
 *  2D  AWN   col=4 rows 0-2: A(0,4)W(1,4)N(2,4)  -- N matches SPRING[4]
 *  3D  NOUN  col=6 rows 0-3: N(0,6)O(1,6)U(2,6)N(3,6) -- N matches RAIN[3]; U new; N(3,6) new
 *  4D  SOL   col=0 rows 2-4: S(2,0)O(3,0)L(4,0)  -- S matches SPRING[0]; L matches LEAF[0]
 *  5D  GAS   col=5 rows 2-4: G(2,5)A(3,5)S(4,5)  -- G matches SPRING[5]; S matches SNOW[0]
 *  8D  NOD   col=6 rows 4-6: N(4,6)O(5,6)D(6,6)  -- N matches SNOW[1]; D matches DEW[0]
 *  9D  ORE   col=7 rows 4-6: O(4,7)R(5,7)E(6,7)  -- O matches SNOW[2]; E matches DEW[1]
 * 10D  WOW   col=8 rows 4-6: W(4,8)O(5,8)W(6,8)  -- W matches SNOW[3]; W matches DEW[2]
 * 12D  SIR   col=3 rows 6-8: S(6,3)I(7,3)R(8,3)  -- S matches MIST[2]; R matches FERN[2]
 * 13D  TAN   col=4 rows 6-8: T(6,4)A(7,4)N(8,4)  -- T matches MIST[3]; N matches FERN[3]
 * 15D  ERA   col=7 rows 6-8: E(6,7)R(7,7)A(8,7)  -- E matches DEW[1]; A matches OAK[1]
 * 16D  WOK   col=8 rows 6-8: W(6,8)O(7,8)K(8,8)  -- W matches DEW[2]; K matches OAK[2]
 */
export const NATURE_PUZZLE: PuzzleDef = {
  id: 'nature-1',
  title: 'Nature & Seasons',
  gridSize: 9,
  words: [
    // ── ACROSS ──────────────────────────────────────────────────────────────
    { id: 'a1',  number: 1,  direction: 'across', row: 0, col: 3, length: 4, answer: 'RAIN',   clue: 'Water falling from clouds' },
    { id: 'a4',  number: 4,  direction: 'across', row: 2, col: 0, length: 6, answer: 'SPRING', clue: 'Season of blooms and new beginnings' },
    { id: 'a6',  number: 6,  direction: 'across', row: 4, col: 0, length: 4, answer: 'LEAF',   clue: 'Flat green part of a plant' },
    { id: 'a7',  number: 7,  direction: 'across', row: 4, col: 5, length: 4, answer: 'SNOW',   clue: 'White winter precipitation' },
    { id: 'a11', number: 11, direction: 'across', row: 6, col: 1, length: 4, answer: 'MIST',   clue: 'Light morning fog over a meadow' },
    { id: 'a14', number: 14, direction: 'across', row: 6, col: 6, length: 3, answer: 'DEW',    clue: 'Morning moisture on grass blades' },
    { id: 'a17', number: 17, direction: 'across', row: 8, col: 1, length: 4, answer: 'FERN',   clue: 'Leafy plant found on forest floors' },
    { id: 'a18', number: 18, direction: 'across', row: 8, col: 6, length: 3, answer: 'OAK',    clue: 'Sturdy tree that produces acorns' },

    // ── DOWN ────────────────────────────────────────────────────────────────
    { id: 'd1',  number: 1,  direction: 'down', row: 0, col: 3, length: 3, answer: 'RAI',  clue: 'North African musical style' },
    { id: 'd2',  number: 2,  direction: 'down', row: 0, col: 4, length: 3, answer: 'AWN',  clue: 'Bristle-like fiber on grain stalks' },
    { id: 'd3',  number: 3,  direction: 'down', row: 0, col: 6, length: 4, answer: 'NOUN', clue: 'Word naming a person, place, or thing' },
    { id: 'd4',  number: 4,  direction: 'down', row: 2, col: 0, length: 3, answer: 'SOL',  clue: 'Fifth note of the do-re-mi scale' },
    { id: 'd5',  number: 5,  direction: 'down', row: 2, col: 5, length: 3, answer: 'GAS',  clue: 'Invisible substance like air or vapor' },
    { id: 'd8',  number: 8,  direction: 'down', row: 4, col: 6, length: 3, answer: 'NOD',  clue: 'Gentle downward head movement of agreement' },
    { id: 'd9',  number: 9,  direction: 'down', row: 4, col: 7, length: 3, answer: 'ORE',  clue: 'Rock containing valuable metal deposits' },
    { id: 'd10', number: 10, direction: 'down', row: 4, col: 8, length: 3, answer: 'WOW',  clue: 'Exclamation of amazement and wonder' },
    { id: 'd12', number: 12, direction: 'down', row: 6, col: 3, length: 3, answer: 'SIR',  clue: 'Respectful title for a man' },
    { id: 'd13', number: 13, direction: 'down', row: 6, col: 4, length: 3, answer: 'TAN',  clue: 'Light brown color; sun-kissed skin tone' },
    { id: 'd15', number: 15, direction: 'down', row: 6, col: 7, length: 3, answer: 'ERA',  clue: 'A distinct period of history' },
    { id: 'd16', number: 16, direction: 'down', row: 6, col: 8, length: 3, answer: 'WOK',  clue: 'Round-bottomed pan used in stir-frying' },
  ],
};
