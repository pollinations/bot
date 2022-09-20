import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { EVENTS } from './config/events.js';
import { createStore } from './store.js';
import logger from './logger.js';

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
  client.on(event.on, (...args) => {
    console.log(`${event.debugName} event triggered on ${event.on}`);
    event.execute(client, ...args);
  });
  logger.info(`Registered custom event '${event.debugName}' for discord.js event '${event.on}'`);
});

client.once('ready', () => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

client.login(token);
