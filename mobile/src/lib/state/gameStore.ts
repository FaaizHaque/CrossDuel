import { create } from 'zustand';

export interface GameState {
  sessionId: string | null;
  playerId: string | null;
  playerName: string;
  playerNumber: 1 | 2 | null;
  opponentName: string;
  status: 'idle' | 'waiting' | 'active' | 'finished';
  myScore: number;
  opponentScore: number;
  myWords: number[];
  opponentWords: number[];
  myErrors: number;
  opponentErrors: number;
  winnerId: string | null;
  player1Score: number;
  player2Score: number;
  startedAt: string | null;
  clues: Record<string, string>;
  // actions
  setPlayerName: (name: string) => void;
  setGame: (data: Partial<Omit<GameState, 'setPlayerName' | 'setGame' | 'resetGame' | 'setSession' | 'updateMyScore' | 'updateOpponentScore' | 'addMyWord' | 'addOpponentWord' | 'addOpponentError' | 'setWinner' | 'reset'>>) => void;
  setSession: (data: Partial<GameState>) => void;
  updateMyScore: (score: number) => void;
  updateOpponentScore: (score: number) => void;
  addMyWord: (wordIndex: number) => void;
  addOpponentWord: (wordIndex: number) => void;
  addOpponentError: () => void;
  setWinner: (winnerId: string, p1Score: number, p2Score: number) => void;
  reset: () => void;
  resetGame: () => void;
}

const initialState = {
  sessionId: null,
  playerId: null,
  playerName: 'Anonymous',
  playerNumber: null as 1 | 2 | null,
  opponentName: 'Waiting...',
  status: 'idle' as const,
  myScore: 0,
  opponentScore: 0,
  myWords: [] as number[],
  opponentWords: [] as number[],
  myErrors: 0,
  opponentErrors: 0,
  winnerId: null,
  player1Score: 0,
  player2Score: 0,
  startedAt: null,
  clues: {} as Record<string, string>,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  setPlayerName: (name) => set({ playerName: name }),
  setGame: (data) => set((s) => ({ ...s, ...data })),
  setSession: (data) => set((s) => ({ ...s, ...data })),
  updateMyScore: (score) => set({ myScore: score }),
  updateOpponentScore: (score) => set({ opponentScore: score }),
  addMyWord: (wordIndex) =>
    set((s) => ({
      myWords: s.myWords.includes(wordIndex) ? s.myWords : [...s.myWords, wordIndex],
    })),
  addOpponentWord: (wordIndex) =>
    set((s) => ({
      opponentWords: s.opponentWords.includes(wordIndex)
        ? s.opponentWords
        : [...s.opponentWords, wordIndex],
    })),
  addOpponentError: () => set((s) => ({ opponentErrors: s.opponentErrors + 1 })),
  setWinner: (winnerId, p1Score, p2Score) =>
    set({ winnerId, player1Score: p1Score, player2Score: p2Score, status: 'finished' }),
  reset: () => set({ ...initialState }),
  resetGame: () => set({ ...initialState }),
}));
