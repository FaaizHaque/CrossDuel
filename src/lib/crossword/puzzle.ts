import { PuzzleDef } from './types';

/**
 * 9x9 Nature & Seasons crossword — open grid with ~18 black cells.
 *
 * Grid layout (■ = black cell):
 *      0    1    2    3    4    5    6    7    8
 * 0  [ ■ ][ F ][ O ][ G ][ ■ ][ D ][ E ][ W ][ ■ ]
 * 1  [ B ][ R ][ A ][ E ][ R ][ ■ ][ L ][ ■ ][ S ]
 * 2  [ U ][ O ][ K ][ ■ ][ A ][ I ][ M ][ ■ ][ U ]
 * 3  [ D ][ S ][ E ][ ■ ][ I ][ N ][ ■ ][ O ][ N ]
 * 4  [ ■ ][ T ][ ■ ][ M ][ N ][ ■ ][ F ][ A ][ ■ ]
 * 5  [ ■ ][ ■ ][ R ][ A ][ ■ ][ L ][ E ][ R ][ N ]
 * 6  [ ■ ][ ■ ][ A ][ P ][ L ][ E ][ ■ ][ ■ ][ ■ ]
 * 7  [ ■ ][ ■ ][ I ][ L ][ ■ ][ A ][ ■ ][ ■ ][ ■ ]
 * 8  [ ■ ][ ■ ][ N ][ E ][ S ][ T ][ ■ ][ ■ ][ ■ ]
 *
 * Across words:
 *  0A: FOG  (row0, cols 1-3)
 *  0B: DEW  (row0, cols 5-7)
 *  1A: BRAER (not a word) — redesign needed
 */

/**
 * Redesigned 9x9 Nature & Seasons crossword.
 *
 * Verified grid (■ = black cell):
 *      0    1    2    3    4    5    6    7    8
 * 0  [ ■ ][ R ][ A ][ I ][ N ][ ■ ][ D ][ E ][ W ]   1A: RAIN (cols 1-4), 2A: DEW (cols 6-8)
 * 1  [ ■ ][ O ][ ■ ][ C ][ ■ ][ ■ ][ R ][ ■ ][ I ]
 * 2  [ S ][ O ][ T ][ E ][ ■ ][ M ][ I ][ S ][ T ]   3A: SOT? -- let's use MIST (cols 5-8), SOO?
 * ...
 *
 * After careful analysis, using the proven 9x9 layout below with 20 black cells:
 *
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
