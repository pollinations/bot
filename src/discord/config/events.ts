import type { Client, ClientEvents } from 'discord.js';
import DmFromChannelEvent from '../events/dmFromChannel.js';
import InteractionCreateEvent from '../events/interactionCreate.js';

export interface EventConfig<K extends keyof ClientEvents> {
  debugName: string;
  on: K;
  execute: (client: Client, ...args: ClientEvents[K]) => Promise<void>;
}

export const EVENTS: EventConfig<any>[] = [DmFromChannelEvent, InteractionCreateEvent];
