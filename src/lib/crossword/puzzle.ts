import { PuzzleDef } from './types';

/**
 * 9x9 hand-crafted crossword — "puzzle-1" by Moin Haque.
 * 25 clues (12 across, 13 down). All answers are real, interlocking words.
 *
 * Grid layout (■ = black cell):
 *      0    1    2    3    4    5    6    7    8
 * 0  [ E ][ M ][ O ][ T ][ I ][ O ][ N ][ A ][ L ]
 * 1  [ L ][ A ][ V ][ A ][ ■ ][ ■ ][ O ][ R ][ E ]
 * 2  [ E ][ L ][ A ][ T ][ E ][ ■ ][ V ][ E ][ T ]
 * 3  [ M ][ E ][ L ][ E ][ ■ ][ ■ ][ A ][ ■ ][ T ]
 * 4  [ E ][ ■ ][ ■ ][ ■ ][ L ][ ■ ][ ■ ][ ■ ][ U ]
 * 5  [ N ][ E ][ C ][ T ][ A ][ R ][ ■ ][ ■ ][ C ]
 * 6  [ T ][ A ][ E ][ ■ ][ T ][ A ][ B ][ L ][ E ]
 * 7  [ S ][ C ][ O ][ ■ ][ C ][ R ][ E ][ E ][ ■ ]
 * 8  [ ■ ][ H ][ ■ ][ ■ ][ H ][ E ][ E ][ D ][ S ]
 */
export const NATURE_PUZZLE: PuzzleDef = {
  id: 'puzzle-1',
  title: 'Puzzle 1',
  gridSize: 9,
  words: [
    // ── ACROSS ──────────────────────────────────────────────────────────────
    { id: 'a1',  number: 1,  direction: 'across', row: 0, col: 0, length: 9, answer: 'EMOTIONAL', clue: 'Sentimental' },
    { id: 'a8',  number: 8,  direction: 'across', row: 1, col: 0, length: 4, answer: 'LAVA',      clue: 'Volcano produce' },
    { id: 'a9',  number: 9,  direction: 'across', row: 1, col: 6, length: 3, answer: 'ORE',       clue: 'Mineral source' },
    { id: 'a10', number: 10, direction: 'across', row: 2, col: 0, length: 5, answer: 'ELATE',     clue: 'Make very happy' },
    { id: 'a11', number: 11, direction: 'across', row: 2, col: 6, length: 3, answer: 'VET',       clue: 'Animal doc' },
    { id: 'a12', number: 12, direction: 'across', row: 3, col: 0, length: 4, answer: 'MELE',      clue: 'Honey, for an Italian' },
    { id: 'a14', number: 14, direction: 'across', row: 5, col: 0, length: 6, answer: 'NECTAR',    clue: 'Plant secretion' },
    { id: 'a18', number: 18, direction: 'across', row: 6, col: 0, length: 3, answer: 'TAE',       clue: 'Korean name' },
    { id: 'a19', number: 19, direction: 'across', row: 6, col: 4, length: 5, answer: 'TABLE',     clue: 'Restaurant furniture' },
    { id: 'a22', number: 22, direction: 'across', row: 7, col: 0, length: 3, answer: 'SCO',       clue: 'Earlier called the Shanghai Five (abbr.)' },
    { id: 'a23', number: 23, direction: 'across', row: 7, col: 4, length: 4, answer: 'CREE',      clue: 'North American tribe' },
    { id: 'a24', number: 24, direction: 'across', row: 8, col: 4, length: 5, answer: 'HEEDS',     clue: 'Listens to' },

    // ── DOWN ────────────────────────────────────────────────────────────────
    { id: 'd1',  number: 1,  direction: 'down', row: 0, col: 0, length: 8, answer: 'ELEMENTS', clue: 'Hydrogen, nitrogen, e.g.' },
    { id: 'd2',  number: 2,  direction: 'down', row: 0, col: 1, length: 4, answer: 'MALE',     clue: 'Gender' },
    { id: 'd3',  number: 3,  direction: 'down', row: 0, col: 2, length: 4, answer: 'OVAL',     clue: 'Egg shape' },
    { id: 'd4',  number: 4,  direction: 'down', row: 0, col: 3, length: 4, answer: 'TATE',     clue: 'Famous art gallery' },
    { id: 'd5',  number: 5,  direction: 'down', row: 0, col: 6, length: 4, answer: 'NOVA',     clue: 'Bright star' },
    { id: 'd6',  number: 6,  direction: 'down', row: 0, col: 7, length: 3, answer: 'ARE',      clue: 'We ___ the world' },
    { id: 'd7',  number: 7,  direction: 'down', row: 0, col: 8, length: 7, answer: 'LETTUCE',  clue: 'Salad need' },
    { id: 'd13', number: 13, direction: 'down', row: 4, col: 4, length: 5, answer: 'LATCH',    clue: 'Lock' },
    { id: 'd15', number: 15, direction: 'down', row: 5, col: 1, length: 4, answer: 'EACH',     clue: 'Per' },
    { id: 'd16', number: 16, direction: 'down', row: 5, col: 2, length: 3, answer: 'CEO',      clue: "Company's head" },
    { id: 'd17', number: 17, direction: 'down', row: 5, col: 5, length: 4, answer: 'RARE',     clue: 'Uncommon' },
    { id: 'd20', number: 20, direction: 'down', row: 6, col: 6, length: 3, answer: 'BEE',      clue: 'Wax maker' },
    { id: 'd21', number: 21, direction: 'down', row: 6, col: 7, length: 3, answer: 'LED',      clue: 'Some bulbs, perhaps' },
  ],
};
