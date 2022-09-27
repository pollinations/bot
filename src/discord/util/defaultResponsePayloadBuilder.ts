import { buildDefaultResponseEmbeds, buildMainEmbed } from './discord.js/embeds.js';
import type { ResponsePayloadBuilder } from './executePollen.js';

export const defaultResponsePayloadBuilder = (title: string, prompt?: string) =>
  ((data, on) => {
    if (on === 'error') {
      const { mainEmbed, imageEmbeds } = buildDefaultResponseEmbeds(title, prompt, data?.images, data?.outputCid, 3);
      return { embeds: [mainEmbed, ...imageEmbeds] };
    } else if (on === 'init') {
      const embed = buildMainEmbed(title, null, prompt);
      return {
        embeds: [embed]
      };
    } else if (on === 'update') {
      const status = data!.success ? 2 : 1;
      const { mainEmbed, imageEmbeds } = buildDefaultResponseEmbeds(
        title,
        prompt,
        data!.images,
        data!.outputCid,
        status
      );
      return { embeds: [mainEmbed, ...imageEmbeds] };
    } else return false;
  }) as ResponsePayloadBuilder;
