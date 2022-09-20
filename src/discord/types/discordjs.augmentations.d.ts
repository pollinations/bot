import 'discord.js';
import type { Store } from '../store.js';
declare module 'discord.js' {
  export interface Client {
    store: Store;
  }
}
