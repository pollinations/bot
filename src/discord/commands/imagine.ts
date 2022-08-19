import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder, Message } from 'discord.js';
import { getPollensThatHavePromptParam } from '../util/getPollensThatHavePromptParam';
import { POLLENS } from '../config/pollens';
import type { Command } from '../config/commands';
import { runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import { extractMediaFromIpfsResponse } from '../util/extractMediaFromIpfsResponse';
import { downloadFiles } from '../util/downloadFiles';
import lodash from 'lodash';
const ImagineCommand: Command = {
  data: {
    name: 'imagine',
    type: ApplicationCommandType.ChatInput,
    description: 'imagine a based  on a text prompt',
    options: [
      {
        name: 'prompt',
        type: ApplicationCommandOptionType.String,
        description: 'the prompt to imagine',
        required: true
      },
      {
        name: 'model',
        required: false,
        description: 'the model to use',
        type: ApplicationCommandOptionType.String,
        choices: getPollensThatHavePromptParam(POLLENS).map(({ name, displayName }) => ({
          name: displayName || name,
          value: name
        }))
      }
    ]
  },
  execute: async (interaction) => {
    const prompt = interaction.options.getString('prompt')!;
    const pollenId = interaction.options.getString('model')!;
    const pollen = POLLENS.find((model) => model.name === pollenId)!;

    await interaction.reply(`Creating: **${prompt}** using model: **${pollen.displayName}**`);

    const promptParam = pollen.params.find((p) => p.isPrimaryTextPrompt)!;

    const results = runModelGenerator(
      {
        [promptParam.name]: prompt
      },
      pollen.computeUrl
    );

    const editReply = lodash.throttle(interaction.editReply.bind(interaction), 10000);

    for await (const data of results) {
      console.log('got data', data);

      const output = data.output;
      const contentID = data['.cid'];

      const images = extractMediaFromIpfsResponse(output).slice(0, 1);
      console.log('got images', images);

      const files = await downloadFiles(images, '.mp4');
      const embeds = images.map(([_filename, image]) => createEmbed(pollen.displayName!, prompt, image, contentID));
      await editReply({ embeds, files });
    }
  }
};

export default ImagineCommand;

function createEmbed(modelNameHumanReadable: string, messageWithoutBotName: string, image: string, contentID: string) {
  return new EmbedBuilder()
    .setDescription(`Model: **${modelNameHumanReadable}**`)
    .setTitle(messageWithoutBotName.slice(0, 250))
    .setImage(image)
    .setURL(`https://pollinations.ai/p/${contentID}`);
}
