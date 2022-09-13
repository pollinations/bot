import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { getPollensThatHavePromptParam, isPrimaryPromptParam } from '../util/promptParamHandling.js';
import { POLLENS } from '../config/pollens.js';
import type { Command } from '../config/commands.js';
import { executePollen } from '../shared/executePollen.js';
import { createEmbed } from '../util/discord.js/createEmbed.js';
import lodash from 'lodash';
import botTexts from '../config/botTexts.js';

const CreateCommand: Command = {
  data: {
    name: 'create',
    type: ApplicationCommandType.ChatInput,
    description: 'Imagine an image based on a text prompt using a specific pollen',
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
        description: 'the pollen to use',
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

export default CreateCommand;
