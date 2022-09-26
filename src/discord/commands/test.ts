import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../config/commands.js';

const TestCommand: Command<ChatInputCommandInteraction> = {
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
