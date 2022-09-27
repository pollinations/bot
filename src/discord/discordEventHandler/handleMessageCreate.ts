import type { ClientEvents, GuildTextBasedChannel, Message } from 'discord.js';
import { CHANNEL_CONFIG } from '../config/channels.js';
import { parseTextWithBotMention } from '../util/discord.js/parseTextWithBotMention.js';
import _ from 'lodash';
import { executePollenAndUpdateUI } from '../util/executePollenAndUpdateUI.js';
import { createParamSet } from '../util/createParamSet.js';
import { getPollenFromChannelName } from '../util/getPollenByChannelName.js';
const channelNames = Object.keys(CHANNEL_CONFIG);

const clickableChannelIDs = channelNames
  .map((channelName) => `<#${CHANNEL_CONFIG[channelName]!.channelId}>`)
  .join(', ');

export const handleMessageCreate = async (...args: ClientEvents['messageCreate']) => {
  const msg = args[0];
  const { logger } = msg;

  const { restOfMessage: prompt } = parseTextWithBotMention(msg.content);
  const channelName = (msg.channel as GuildTextBasedChannel).name;
  const pollen = getPollenFromChannelName(channelName);
  const attachments = msg.attachments.map((a) => a.url);

  // return if channel is not configured
  if (!pollen) {
    logger.info({ channelName }, 'Could not find pollen configuration');
    await msg.react('🚫');
    await msg.reply(
      'This channel is not supported. Please use one of the following channels to send your prompt: ' +
        clickableChannelIDs
    );
    return;
  }

  logger.info(
    {
      pollenId: pollen.id,
      channelName,
      prompt,
      attachments
    },
    `Got dm`
  );

  const params = createParamSet(pollen, prompt);
  await msg.react('🐝');
  await executePollenAndUpdateUI(pollen, params, msg, prompt);
  return true;
};
