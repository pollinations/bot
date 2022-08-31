import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { getPollensThatHavePromptParam, isPrimaryPromptParam } from '../util/promptParamHandling';
import { POLLENS } from '../config/pollens';
import type { Command } from '../config/commands';
import { POLLINATORS } from '../config/pollinators';
import { executePollen } from '../shared/executePollen';

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

    // #TODO: can be transformed to external fetch for available pollinator that runs this pollen
    const pollinator = POLLINATORS.find((pollinator) => pollinator.pollenId === pollenId)!;

    const pollen = POLLENS.find((p) => p.id === pollenId)!;
    const promptParam = pollen.params.find(isPrimaryPromptParam)!;
    const params = {
      [promptParam.name]: prompt
    };
    executePollen(pollen, pollinator, params, interaction);
  }
};

export default ImagineCommand;
