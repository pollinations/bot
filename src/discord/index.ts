import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { EVENTS } from './config/events.js';
import { createStore } from './store.js';

const token = process.env['DISCORD_TOKEN'];
// create bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
    // GatewayIntentBits.MessageContent
  ]
});
client.store = createStore();

// register events on client
EVENTS.forEach((event) => {
  client.on(event.on, (...args) => {
    console.log(`${event.debugName} event triggered on ${event.on}`);
    event.execute(client, ...args);
  });
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(token);
