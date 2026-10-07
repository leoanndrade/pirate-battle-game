import { create } from 'zustand';

export type GameState = 'START_MENU' | 'OPTIONS_MENU' | 'LOG_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';
export type LogTab = 'RANKING' | 'HISTORY';
export type GameOverReason = 'TIME_UP' | 'PLAYER_DIED';

export interface MatchResult {
  reason: GameOverReason;
  /** Seconds actually played */
  duration: number;
}

interface GameStore {
  gameState: GameState;
  score: number;
  timeRemaining: number;
  matchDuration: number; // config from options
  spawnRate: number; // config from options

  /** Screen to return to when leaving Options (START_MENU or PAUSED) */
  optionsReturnTo: GameState;
  logTab: LogTab;
  lastResult: MatchResult | null;

  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setTimeRemaining: (time: number) => void;
  setMatchDuration: (duration: number) => void;
  setSpawnRate: (rate: number) => void;
  openOptions: (returnTo: GameState) => void;
  openLog: (tab: LogTab) => void;
  setLogTab: (tab: LogTab) => void;
  setLastResult: (result: MatchResult) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'START_MENU',
  score: 0,
  timeRemaining: 60,
  matchDuration: 60,
  spawnRate: 3.0,
  optionsReturnTo: 'START_MENU',
  logTab: 'RANKING',
  lastResult: null,

  setGameState: (state) => set({ gameState: state }),
  setScore: (score) => set({ score }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setMatchDuration: (matchDuration) => {
    set({ matchDuration, timeRemaining: matchDuration });
    localStorage.setItem('pirate_matchDuration', matchDuration.toString());
  },
  setSpawnRate: (spawnRate) => {
    set({ spawnRate });
    localStorage.setItem('pirate_spawnRate', spawnRate.toString());
  },
  openOptions: (returnTo) => set({ gameState: 'OPTIONS_MENU', optionsReturnTo: returnTo }),
  openLog: (tab) => set({ gameState: 'LOG_MENU', logTab: tab }),
  setLogTab: (logTab) => set({ logTab }),
  setLastResult: (lastResult) => set({ lastResult }),
}));

const savedDuration = localStorage.getItem('pirate_matchDuration');
if (savedDuration) {
  useGameStore.setState({ matchDuration: parseInt(savedDuration), timeRemaining: parseInt(savedDuration) });
}
const savedSpawnRate = localStorage.getItem('pirate_spawnRate');
if (savedSpawnRate) {
  useGameStore.setState({ spawnRate: parseFloat(savedSpawnRate) });
}
