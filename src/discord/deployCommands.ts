import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { COMMANDS } from './config/commands';

// CREDENTIALS
const DISCORD_TOKEN = process.env['DISCORD_TOKEN'] || 'no token specified in .env file';
const CLIENT_ID = process.env['CLIENT_ID'] || 'no client id specified in .env file';
const GUILD_ID = process.env['GUILD_ID'] || 'no guild id specified in .env file';

const body = COMMANDS.map((config) => config.data);

const deployCommands = async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await new REST({ version: '10' })
      .setToken(DISCORD_TOKEN)
      .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};

deployCommands();
