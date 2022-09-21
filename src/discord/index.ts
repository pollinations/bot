import 'dotenv/config';
import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import { createStore } from './store.js';
import logger from './logger.js';
import type { EventConfig } from './types/misc.js';

// events
import DmFromChannelEvent from './events/dmFromChannel.js';
import InteractionCreateEvent from './events/interactionCreate.js';
import { ERROR_MESSAGES } from './config/botTexts.js';

// CONFIGURATION
// declare all events to be registered here
const EVENTS: EventConfig<any>[] = [DmFromChannelEvent, InteractionCreateEvent];

const token = process.env['DISCORD_TOKEN'];

logger.info('Starting bot client...');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
    // GatewayIntentBits.MessageContent
  ]
});

logger.info('Adding custom state store to bot client...');
client.store = createStore();

logger.info('Registering events...');
EVENTS.forEach((event) => {
  client.on(event.on, async (...args) => {
    // create child logger and add it to interaction
    // child logger now contains default metadata for interaction
    const interaction: Interaction = args[0];
    interaction.logger = logger.child({
      userId: interaction.user?.id,
      guildId: interaction.guild?.id || 'DM',
      channelId: interaction.channelId,
      type: interaction.type
    });
    try {
      // Execute the event handler
      await event.execute(...args);
    } catch (error) {
      // Handle uncaught exceptions in event handlers
      interaction.logger.error(`Unhandled exception while executing event: on:${event.on} => ${event.debugName}`, {
        error
      });
      if (interaction.isRepliable()) interaction.reply({ content: ERROR_MESSAGES.SERVER_ERROR(), ephemeral: true });
    }
  });
  logger.info(`Registered custom event '${event.debugName}' for discord.js event '${event.on}'`);
});
logger.info('All events registered. Logging in...');
client.once('ready', () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

client.login(token);
