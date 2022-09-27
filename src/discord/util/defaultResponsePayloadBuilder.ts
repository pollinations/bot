import { buildDefaultResponsePayload, buildMainEmbed } from './discord.js/embeds.js';
import { downloadFile } from './downloadFile.js';
import type { ResponsePayloadBuilder } from './executePollen.js';

export const defaultResponsePayloadBuilder = (title: string, prompt?: string) =>
  (async (data, on) => {
    if (on === 'error') {
      const { mainEmbed, imageEmbeds } = buildDefaultResponsePayload(title, data, prompt, 3);

      const videoSrc = data?.videos.shift();
      const video = videoSrc && (await downloadFile(videoSrc));
      const files = video && [video];
      return { embeds: [mainEmbed, ...imageEmbeds], files };
    } else if (on === 'init') {
      const embed = buildMainEmbed(title, null, prompt);
      return {
        embeds: [embed]
      };
    } else if (on === 'update') {
      const status = data!.success ? 2 : 1;
      const { mainEmbed, imageEmbeds } = buildDefaultResponsePayload(title, data, prompt, status);

      const videoSrc = data?.videos.shift();
      const video = videoSrc && (await downloadFile(videoSrc));
      const files = video && [video];
      return { embeds: [mainEmbed, ...imageEmbeds], files };
    } else return false;
  }) as ResponsePayloadBuilder;
