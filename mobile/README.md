# Cross Duel — Mobile App

A competitive crossword puzzle game built with Expo React Native.

## Features

- **9x9 Crossword Grid** — Full puzzle grid with black/white cells, word numbering, and directional navigation
- **Smart Input** — Auto-advance to next cell after letter entry; backspace moves back
- **Word Highlighting** — Active word (Across or Down) highlighted in warm amber; active cell in electric yellow
- **Direction Toggle** — Tap same cell twice to switch between Across/Down
- **Word Numbers** — Automatically computed and displayed in top-left of starting cells
- **Mobile-Optimized** — Responsive cell sizing based on screen width; keyboard-aware layout

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Puzzle | `(tabs)/index` | Main crossword grid gameplay screen |
| Duels  | `(tabs)/two`   | Placeholder for future competitive matchmaking |

## Components

### `CrosswordGrid`
Located at `src/components/CrosswordGrid.tsx`.

**Props**: None (self-contained)

**State**:
- `letterGrid` — 9×9 string array of cell letters
- `activeCell` — currently selected `{row, col}`
- `direction` — `'across' | 'down'`

**Key Functions**:
- `isBlackCell(row, col)` — checks if a cell is a black cell
- `getWordCells(row, col, dir)` — returns all cells in the word at that position
- `getWordNumber(row, col)` — returns the label number for a starting cell
- `handleCellPress(row, col)` — tap handler (select or toggle direction)
- `handleLetterInput(row, col, text)` — stores letter and advances cursor
- `handleBackspace(row, col)` — clears letter and moves cursor back

## Design

- **Theme**: Dark editorial — monochromatic near-black with electric yellow `#F5E642` accent
- **Cell Colors**: White `#F5F5F0` / Black `#1A1A1A` / Word highlight `#E8E0C8` / Active `#F5E642`
- **Typography**: System monospace for cell letters; bold uppercase for header
- **Navigation**: Dark tab bar with yellow active indicator

## Tech Stack

- Expo SDK 53 / React Native 0.76
- Expo Router (file-based routing)
- NativeWind (TailwindCSS)
- React Native Reanimated
- Lucide React Native (icons)
