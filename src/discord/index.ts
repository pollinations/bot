import 'dotenv/config';
import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import { createStore } from './store.js';
import logger from './logger.js';
import type { EventConfig } from './types/misc.js';

// events
import DmFromChannelEvent from './events/dmFromChannel.js';
import InteractionCreateEvent from './events/interactionCreate.js';
import { exitInteraction, EXIT_REASONS } from './commands/pollination/shared/errorHandler.js';

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
    interaction.logger = logger.child({ interactionId: interaction.id });
    interaction.logger.info(
      {
        interactionId: interaction.id,
        userId: interaction.user?.id,
        guildId: interaction.guild?.id || 'DM',
        channelId: interaction.channelId,
        type: interaction.type
      },
      `Incoming interaction: ${interaction.id}`
    );
    try {
      // Execute the event handler
      if ((await event.execute(...args)) === true) {
        interaction.logger.info('Event executed successfully');
      }
    } catch (err) {
      // Handle uncaught exceptions in event handlers
      const msg = `Unhandled exception while executing event: on:${event.on} => ${event.debugName}`;
      exitInteraction(interaction, EXIT_REASONS.UNEXPECTED_EXCEPTION(err, msg), 'error');
    }
  });
  logger.info(`Registered custom event '${event.debugName}' for discord.js event '${event.on}'`);
});
logger.info('All events registered. Logging in...');
client.once('ready', () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

client.login(token);
