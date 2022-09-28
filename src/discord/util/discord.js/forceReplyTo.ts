import type { Interaction } from 'discord.js';

export const forceReplyToInteraction = async (interaction: Interaction, content: string) => {
  if (interaction.isRepliable() && !interaction.replied)
    return interaction.reply({
      content: content,
      ephemeral: true
    });
  else interaction.channel?.send({ content });
};
