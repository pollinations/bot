import type { Message } from 'discord.js';
import type { Pollination } from './commands/pollination/index.js';

interface UserState {
  currentSession?: Pollination;
  currentSummary?: Message;
  prevSessions: Record<string, Pollination>; // <pollenId, settings>
  textPromptHistory: string[];
}
export interface Store {
  users: {
    update: (userId: string, update: Partial<UserState>) => void;
    get: (userId: string) => UserState;
  };
}
const createDefaultState = (): UserState => {
  return {
    prevSessions: {} as Record<string, Pollination>,
    textPromptHistory: [] as string[]
  };
};

export const createStore = () => {
  const sessions = new Map();
  const get = (userId: string) => sessions.get(userId) || createDefaultState();
  const update = (userId: string, partialState: Partial<UserState>) => {
    const state = get(userId);
    sessions.set(userId, { ...state, ...partialState });
  };
  return {
    users: {
      update,
      get
    }
  } as Store;
};
