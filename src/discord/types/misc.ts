import type { ClientEvents } from 'discord.js';

export interface EventConfig<K extends keyof ClientEvents> {
  debugName: string;
  on: K;
  execute: (...args: ClientEvents[K]) => Promise<any>;
}
