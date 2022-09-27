import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { getPollensThatHavePromptParam, isPrimaryPromptParam } from '../../util/promptParamHandling.js';
import { POLLENS } from '../../config/pollens.js';
import type { Command } from '../../config/commands.js';
import { executePollen } from '../../util/executePollen.js';
import { exitInteraction, EXIT_REASONS } from '../pollination/shared/errorHandler.js';
import { POLLINATORS } from '../../config/pollinators.js';
import { defaultResponsePayloadBuilder } from '../../util/defaultResponsePayloadBuilder.js';

const CreateCommand: Command<ChatInputCommandInteraction> = {
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
    const { logger } = interaction;
    const prompt = interaction.options.getString('prompt')!;
    const pollenId = interaction.options.getString('model')!;

    const pollen = POLLENS.find((p) => p.id === pollenId)!;
    if (!pollen) return exitInteraction(interaction, EXIT_REASONS.INVALID_POLLEN_ID(pollenId), 'warn');

    const promptParam = pollen.params.find(isPrimaryPromptParam);
    if (!promptParam) return exitInteraction(interaction, EXIT_REASONS.PROMPT_PARAM_NOT_FOUND(pollenId), 'warn');

    const params = {
      [promptParam.name]: prompt
    };
    await interaction.reply('🐝');

    // TODO: fetch this from some sort of pollinator registry
    const pollinator = POLLINATORS.find((pollinator) => pollinator.pollenId === pollen.id)!;

    const responsePayloadBuilder = defaultResponsePayloadBuilder(pollen.displayName, prompt);
    await executePollen(pollen, params, pollinator, interaction, responsePayloadBuilder);
    return true;
  }
};

export default CreateCommand;
