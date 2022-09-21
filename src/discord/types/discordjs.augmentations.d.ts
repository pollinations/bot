import 'discord.js';
import type { Logger } from 'winston';
import type { Store } from '../store.js';

declare module 'discord.js' {
  export interface Client {
    store: Store;
  }
  export interface BaseInteraction {
    logger: Logger;
  }
}
