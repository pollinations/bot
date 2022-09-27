import { type ChatInputCommandInteraction, Message } from 'discord.js';
import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import { buildMainEmbed, buildDefaultResponsePayload, createVideoAttachments } from './discord.js/embeds.js';
import { type UpdateCallback, executePollen } from './executePollen.js';
import type { ParsedPollinationsResponse } from './parsePollinationsResponse.js';

export const executePollenAndUpdateUI = async (
  pollen: PollenDefinition,
  params: Record<string, PollenParamValue>,
  iOrMsg: ChatInputCommandInteraction | Message,
  prompt?: string
) => {
  let lastUpdate: ParsedPollinationsResponse | undefined;
  const title = pollen.displayName;
  // initial response (has no url=cid yet)
  const payload = { embeds: [buildMainEmbed(title, null, prompt)] };
  let response = iOrMsg instanceof Message ? await iOrMsg.reply(payload) : await iOrMsg.channel!.send(payload);
  try {
    const handleUpdate: UpdateCallback = async (data) => {
      lastUpdate = data;
      const { mainEmbed, imageEmbeds } = buildDefaultResponsePayload(title, data, prompt, data.success ? 2 : 1);
      const files = await createVideoAttachments(data.videos);
      response.edit({ embeds: [mainEmbed, ...imageEmbeds], files });
    };
    await executePollen(pollen.id, params, iOrMsg.logger, handleUpdate);
  } catch (err) {
    if (response) {
      const { mainEmbed, imageEmbeds } = buildDefaultResponsePayload(title, lastUpdate, prompt, 3);
      const files = await createVideoAttachments(lastUpdate?.videos);
      await response.edit({ embeds: [mainEmbed, ...imageEmbeds], files });
    }
  }
};
