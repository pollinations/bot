import { runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import lodash from 'lodash';
import type { PollenDefinition, PollenParamValue } from '../config/pollens';
import type { Pollinator } from '../config/pollinators';
import { downloadFiles } from '../util/downloadFiles';
import { extractMediaFromIpfsResponse } from '../util/extractMediaFromIpfsResponse';
import { isPrimaryPromptParam } from '../util/promptParamHandling';

export const executePollen = async (
  pollen: PollenDefinition,
  pollinator: Pollinator,
  params: Record<string, PollenParamValue>,
  interaction: ChatInputCommandInteraction
) => {
  const promptParamDef = pollen.params.find(isPrimaryPromptParam)!;
  const prompt = params[promptParamDef.name]! as string;
  const channel = interaction.channel!;
  const response = await channel.send(`Creating: **${prompt}** using model: **${pollen.displayName}**`);

  const results = runModelGenerator(params, pollinator.url);

  const editResponse = lodash.throttle(response.edit.bind(response), 10000);

  for await (const data of results) {
    console.log('got data', data);

    const output = data.output;
    const contentID = data['.cid'];

    const images = extractMediaFromIpfsResponse(output).slice(0, 1);
    console.log('got images', images);

    const files = await downloadFiles(images, '.mp4');
    const embeds = images.map(([_filename, image]) => createEmbed(pollen.displayName!, prompt, image, contentID));
    await editResponse({ embeds, files });
  }
};

export function createEmbed(
  modelNameHumanReadable: string,
  messageWithoutBotName: string,
  image: string,
  contentID: string
) {
  return new EmbedBuilder()
    .setDescription(`Model: **${modelNameHumanReadable}**`)
    .setTitle(messageWithoutBotName.slice(0, 250))
    .setImage(image)
    .setURL(`https://pollinations.ai/p/${contentID}`);
}
