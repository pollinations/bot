import type { ClientEvents, GuildTextBasedChannel, Message } from 'discord.js';
import { CHANNEL_CONFIG } from '../config/channels.js';
import { PollenParamValue, POLLENS } from '../config/pollens.js';
import { parseTextWithBotMention } from '../util/discord.js/parseTextWithBotMention.js';
import { Data, runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import { isPrimaryPromptParam } from '../util/promptParamHandling.js';
import { POLLINATORS } from '../config/pollinators.js';
import { parsePollinationsResponse } from '../util/parsePollinationsResponse.js';
import _, { create } from 'lodash';
import { buildMainEmbed, buildResponseEmbeds } from '../util/discord.js/embeds.js';
import { executePollen } from '../util/executePollen.js';
const channelNames = Object.keys(CHANNEL_CONFIG);

const clickableChannelIDs = channelNames
  .map((channelName) => `<#${CHANNEL_CONFIG[channelName]!.channelId}>`)
  .join(', ');

export const handleMessageCreate = async (...args: ClientEvents['messageCreate']) => {
  const msg = args[0];
  const { logger } = msg;
  let response: Message | undefined;
  const channel = msg.channel as GuildTextBasedChannel;
  const { restOfMessage: prompt } = parseTextWithBotMention(msg.content);
  const attachmentUrls = msg.attachments.map((a) => a.url);

  // log request
  logger.info(
    {
      channelName: channel.name,
      content: msg.content,
      prompt,
      attachmentUrls
    },
    `Got dm`
  );

  // retrieve pollen definition via channel configuration
  const channelConfig = CHANNEL_CONFIG[channel.name];
  const pollen = channelConfig && POLLENS.find((p) => p.id === channelConfig.pollenId);

  // return if channel is not configured
  if (!pollen) {
    if (!channelConfig) logger.info({ channelName: channel.name }, 'Unsupported channnel name');
    else
      logger.warn(
        { pollenId: channelConfig.pollenId, channelName: channel.name },
        'Could not find pollen configuration'
      );
    // reply with error
    await msg.react('🚫');
    await msg.reply(
      'This channel is not supported. Please use one of the following channels to send your prompt: ' +
        clickableChannelIDs
    );
    return;
  }

  // create param set
  const primaryPromptParamDefinition = pollen.params.find(isPrimaryPromptParam);
  if (!primaryPromptParamDefinition) throw new Error('Pollen does not have a primary prompt param');
  const params = pollen.params.reduce((acc, param) => {
    acc[param.name] = param.defaultValue;
    return acc;
  }, {} as Record<string, PollenParamValue>);
  params[primaryPromptParamDefinition.name] = prompt;

  // get pollinator
  const pollinator = POLLINATORS.find((p) => p.pollenId === pollen.id);
  if (!pollinator) throw new Error('Could not find pollinator for pollen');

  // GOOD TO GO
  msg.react('🐝');
  await executePollen(pollen, params, pollinator, msg, prompt);

  return true;
};
