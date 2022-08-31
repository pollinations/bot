import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { getPollensThatHavePromptParam, isPrimaryPromptParam } from '../util/promptParamHandling';
import { POLLENS } from '../config/pollens';
import type { Command } from '../config/commands';
import { executePollen } from '../shared/executePollen';
import { createEmbed } from '../util/discord.js/createEmbed';
import lodash from 'lodash';
import botTexts from '../config/botTexts';

const ImagineCommand: Command = {
  data: {
    name: 'imagine',
    type: ApplicationCommandType.ChatInput,
    description: 'imagine an image based on a text prompt',
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
        choices: getPollensThatHavePromptParam(POLLENS).map(({ id, model, displayName }) => ({
          name: displayName || model,
          value: id
        }))
      }
    ]
  },
  execute: async (interaction) => {
    const prompt = interaction.options.getString('prompt')!;
    const pollenId = interaction.options.getString('model')!;

    const pollen = POLLENS.find((p) => p.id === pollenId)!;
    const promptParam = pollen.params.find(isPrimaryPromptParam)!;
    const params = {
      [promptParam.name]: prompt
    };
    await interaction.reply(botTexts.onExecutionStart(prompt, pollen.displayName));
    const updateResultMessage = lodash.throttle(interaction.editReply.bind(interaction), 10000);

    for await (const data of executePollen(pollen, params)) {
      const { files, images, ipfs } = data;
      const contentID = ipfs['.cid'];
      const embeds = images.map(([_filename, image]) => createEmbed(pollen.displayName!, prompt, image, contentID));
      updateResultMessage({ embeds, files });
    }
  }
};

export default ImagineCommand;
