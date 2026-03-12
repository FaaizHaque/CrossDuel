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
  myWords: string[];
  opponentWords: string[];
  myErrors: number;
  opponentErrors: number;
  winnerId: string | null;
  startedAt: string | null;
  clues: Record<string, string>;
  // actions
  setPlayerName: (name: string) => void;
  setGame: (data: Partial<Omit<GameState, 'setPlayerName' | 'setGame' | 'resetGame'>>) => void;
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
  myWords: [] as string[],
  opponentWords: [] as string[],
  myErrors: 0,
  opponentErrors: 0,
  winnerId: null,
  startedAt: null,
  clues: {} as Record<string, string>,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  setPlayerName: (name) => set({ playerName: name }),
  setGame: (data) => set((s) => ({ ...s, ...data })),
  resetGame: () => set({ ...initialState }),
}));
