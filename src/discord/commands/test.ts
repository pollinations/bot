import { ApplicationCommandType } from 'discord.js';
import type { Command } from '../config/commands';

const TestCommand: Command = {
  data: {
    name: 'test',
    type: ApplicationCommandType.ChatInput,
    description: 'my test command'
  },
  execute: async (interaction) => {
    await interaction.reply('hi');
  }
};
export default TestCommand;
