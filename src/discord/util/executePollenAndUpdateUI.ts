import { type ChatInputCommandInteraction, Message } from 'discord.js';
import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import {
  buildMainEmbed,
  buildDefaultResponsePayload,
  createVideoAttachments,
  MainEmbedOptions
} from './discord.js/embeds.js';
import { EMBED_HELPERS } from './discord.js/pollenEmbedHelpers.js';
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
  const staticEmbedOptions: MainEmbedOptions = {
    title,
    prompt,
    description: pollen.description,
    thumbnailUrl: pollen.thumbnailUrl,
    outputs: pollen.outputs
  };

  const pollenEmbedModifier = EMBED_HELPERS[pollen.id];

  // send main response, the response object will be reused when intermeidate updates are received
  const payload = { embeds: [buildMainEmbed({ ...staticEmbedOptions })] };
  let response = iOrMsg instanceof Message ? await iOrMsg.reply(payload) : await iOrMsg.channel!.send(payload);
  try {
    const handleUpdate: UpdateCallback = async (data) => {
      lastUpdate = data;
      const { mainEmbed, imageEmbeds } = buildDefaultResponsePayload(
        {
          ...staticEmbedOptions,
          statusCode: data.success ? 2 : 1
        },
        data,
        pollenEmbedModifier
      );
      const files = await createVideoAttachments(data.videos, pollen.outputs);
      response.edit({ embeds: [mainEmbed, ...imageEmbeds], files });
    };
    await executePollen(pollen.id, params, iOrMsg.logger, handleUpdate);
  } catch (err) {
    if (response) {
      const { mainEmbed, imageEmbeds } = buildDefaultResponsePayload(
        { ...staticEmbedOptions, statusCode: 3 },
        lastUpdate,
        pollenEmbedModifier
      );
      const files = await createVideoAttachments(lastUpdate?.videos || [], pollen.outputs);
      await response.edit({ embeds: [mainEmbed, ...imageEmbeds], files });
    }
  }
};
