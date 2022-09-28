import 'discord.js';
import type { Store } from '../store.js';
import { Logger } from 'pino';
declare module 'discord.js' {
  export interface Client {
    store: Store;
  }
  export interface BaseInteraction {
    logger: Logger;
  }
  export interface Message {
    logger: Logger;
  }
}
