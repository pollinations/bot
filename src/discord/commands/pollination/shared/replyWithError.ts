import type { CommandInteraction } from 'discord.js';

export const replyWithError = (message: string, interaction: CommandInteraction) => {
  interaction.reply({ content: message, ephemeral: true });
};
