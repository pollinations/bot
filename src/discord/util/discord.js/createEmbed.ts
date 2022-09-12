import { EmbedBuilder } from 'discord.js';

export function createEmbed(modelNameHumanReadable: string, prompt: string, image: string, contentID: string) {
  return new EmbedBuilder()
    .setDescription(`Model: **${modelNameHumanReadable}**`)
    .setTitle(prompt.slice(0, 250))
    .setImage(image)
    .setURL(`https://pollinations.ai/p/${contentID}`);
}
