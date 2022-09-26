import type { Interaction, Message, MessageEditOptions, MessageOptions, MessagePayload } from 'discord.js';

export const upsertSummary = async (
  interaction: Interaction,
  messagePayload: MessageEditOptions & MessageOptions,
  currentSummary: Message | undefined
) => {
  let newSummaryPromise: Promise<Message>;
  if (currentSummary)
    if (currentSummary.channelId === interaction.channelId) newSummaryPromise = currentSummary.edit(messagePayload);
    else {
      // await (currentSummary.pinned && currentSummary.unpin());
      // currentSummary.delete();
      newSummaryPromise = interaction.channel!.send(messagePayload);
      currentSummary?.edit({ content: 'Configuration has moved away from this channel' });
    }
  else newSummaryPromise = interaction.channel!.send(messagePayload);
  return newSummaryPromise;
};
