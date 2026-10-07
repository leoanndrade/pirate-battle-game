export type GameEvents = {
  SCORE_CHANGED: (score: number) => void;
  TIME_CHANGED: (timeRemaining: number) => void;
  GAME_OVER: (reason: 'TIME_UP' | 'PLAYER_DIED') => void;
  PLAYER_HEALTH_CHANGED: (health: number) => void;
  PLAYER_TOOK_DAMAGE: () => void;
};

class EventEmitter {
  private listeners: { [K in keyof GameEvents]?: Array<GameEvents[K]> } = {};

  on<K extends keyof GameEvents>(event: K, listener: GameEvents[K]) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return () => this.off(event, listener); // Returns an unsubscribe function
  }

  off<K extends keyof GameEvents>(event: K, listener: GameEvents[K]) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener) as any;
  }

  emit<K extends keyof GameEvents>(event: K, ...args: Parameters<GameEvents[K]>) {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach((listener) => {

      (listener as any)(...args);
    });
  }
}

export const gameEvents = new EventEmitter();
