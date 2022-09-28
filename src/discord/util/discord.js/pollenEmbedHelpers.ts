import { bold, EmbedBuilder, hyperlink } from 'discord.js';
import type { ParsedPollinationsResponse } from '../parsePollinationsResponse.js';
export type PollenSpecificEmbedModifier = (
  embedBuilder: EmbedBuilder,
  data?: ParsedPollinationsResponse
) => EmbedBuilder;

export const EMBED_HELPERS: Record<string, PollenSpecificEmbedModifier> = {
  'pimped-diffusion': (eb, data) => {
    const numImages = data?.images.length || 0;
    const latestStatus = data?.status.pop();
    if (latestStatus) {
      const pimpedPrompts = (latestStatus.payload as string).split('\n');
      const markdown = pimpedPrompts
        .map((p, i) => {
          let suffix = '';
          if (i >= numImages) {
            suffix = bold('(not rendered)');
          } else {
            const image = data?.images[i];
            suffix = image ? `[${hyperlink('link', image[1] as string)}]` : '';
          }
          return `${i + 1}. ${p} ${suffix}`;
        })
        .join('\n\n');

      const fields = eb.data.fields || [];
      eb.setFields(
        ...fields.map((f) => {
          if (f.name === 'Status') return { name: 'Status', value: f.value + ' - ' + latestStatus.title };
          else return f;
        }),
        { name: 'Pimped prompts', value: markdown }
      );
    }
    return eb;
  }
};
