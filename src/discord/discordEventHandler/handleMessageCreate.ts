import { ALLOWED_EXTENSIONS, ClientEvents, GuildTextBasedChannel } from 'discord.js';
import { CHANNEL_CONFIG } from '../config/channels.js';
import { parseTextWithBotMention } from '../util/discord.js/parseTextWithBotMention.js';
import _ from 'lodash';
import { executePollenAndUpdateUI } from '../util/executePollenAndUpdateUI.js';
import { createParamSet } from '../util/createParamSet.js';
import { getPollenFromChannelName } from '../util/getPollenByChannelName.js';
import { createImplicitParamOverrides } from '../util/createImplicitParamOverrides.js';
import { findMissingRequiredParams } from '../util/findMissingRequiredParams.js';
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
  const images = msg.attachments.filter((a) => ALLOWED_EXTENSIONS.some((ext) => a.url.endsWith(ext))).map((a) => a.url);
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
      images
    },
    `Got dm`
  );
  const overrides = createImplicitParamOverrides(pollen, prompt, images);
  const params = createParamSet(pollen, overrides);
  const missingRequiredParams = findMissingRequiredParams(pollen, params).map((p) => p.displayName || p.name);
  console.log(missingRequiredParams);

  if (missingRequiredParams) {
    logger.warn({ missingRequiredParams }, 'Missing required params');
    return await msg.reply({
      content: `Missing required params: ${missingRequiredParams.join(', ')}`
    });
  }
  await msg.react('🐝');

  await executePollenAndUpdateUI(pollen, params, msg, prompt);
  return true;
};
