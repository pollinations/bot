import 'dotenv/config';
import { Client, GatewayIntentBits, Interaction, Message } from 'discord.js';
import { createStore } from './store.js';
import logger from './logger.js';

// events
import { handleMessageCreate } from './discordEventHandler/handleMessageCreate.js';
import { handleInteractionCreate } from './discordEventHandler/handleInteractionCreate.js';
import { forceReplyToInteraction } from './util/forceReplyTo.js';

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

// handles slash commands, autocomplete, context menu and message components
client.on('interactionCreate', async (interaction) => {
  if (interaction.user.bot) logger.debug('Ignoring interaction from bot');
  interaction.logger = createInteractionLogger(interaction);
  try {
    await handleInteractionCreate(interaction);
  } catch (err) {
    // top level catch
    interaction.logger.error(err, 'Unhandled exception while executing event "messageCreate"');
    forceReplyToInteraction(interaction, 'An unexpected error occurred, please try again later');
  }
});

// handles dm's
client.on('messageCreate', async (message) => {
  if (message.author.bot) return logger.debug('Ignoring message from bot');

  // return if message is not a mention of the bot
  const botIDString = `<@${message.client.user?.id}>`;
  if (message.content.indexOf(botIDString) === -1) return logger.debug('Ignoring message that is not a bot mention');

  // initiate and execute interaction-based session
  message.logger = createInteractionLogger(message);
  try {
    await handleMessageCreate(message);
  } catch (err) {
    message.logger.error(err, 'Unhandled exception while executing event');
    message.reply('An unexpected error occurred while executing your command. Please try again later.');
  }
});

client.once('ready', () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

client.login(token);

// returns a logger with interaction-specific meta data for better tracing
const createInteractionLogger = (interaction: Interaction | Message) => {
  const interactionLogger = logger.child({ interactionId: interaction.id });
  const userId = interaction instanceof Message ? interaction.author.id : interaction.user.id;
  interactionLogger.info(
    {
      interactionId: interaction.id,
      userId,
      guildId: interaction.guild?.id || 'DM',
      channelId: interaction.channelId,
      type: interaction.type
    },
    `Incoming interaction: ${interaction.id}`
  );
  return interactionLogger;
};
