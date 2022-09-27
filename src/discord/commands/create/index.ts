import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildTextBasedChannel
} from 'discord.js';
import { getPollensThatHavePromptParam } from '../../util/promptParamHandling.js';
import { POLLENS } from '../../config/pollens.js';
import type { Command } from '../../config/commands.js';
import { executePollenAndUpdateUI } from '../../util/executePollenAndUpdateUI.js';
import { createParamSet } from '../../util/createParamSet.js';

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
  execute: async (i) => {
    const { logger } = i;
    const prompt = i.options.getString('prompt')!;
    const pollenId = i.options.getString('model')!;
    const channelName = (i.channel as GuildTextBasedChannel).name;
    logger.info(
      {
        channelName,
        prompt,
        pollenId
      },
      `Got 'Create' command`
    );

    const pollen = POLLENS.find((p) => p.id === pollenId)!;
    if (!pollen) {
      logger.warn({ pollenId }, 'Could not find pollen configuration');
      return await i.reply({ ephemeral: true, content: `Could not find pollen configuration by id ${pollenId}` });
    }

    const params = createParamSet(pollen, prompt);
    await i.reply('🐝');
    await executePollenAndUpdateUI(pollen.id, params, i, prompt);
    return true;
  }
};

export default CreateCommand;
