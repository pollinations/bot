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
import { getPollenFromChannelName } from '../../util/getPollenByChannelName.js';

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
        autocomplete: true
      }
    ]
  },
  autoCompleteHandler: async (i) => {
    const userInput = i.options.getString('model') || '';
    const channelName = (i.channel as GuildTextBasedChannel).name;
    const pollen = getPollenFromChannelName(channelName);
    let choices = pollen
      ? [pollen]
      : getPollensThatHavePromptParam(POLLENS).filter(
          (p) => !userInput || p.displayName.toLowerCase().startsWith(userInput.toLowerCase())
        );
    return i.respond(choices.map((p) => ({ name: p.displayName, value: p.id })));
  },
  execute: async (i) => {
    const { logger } = i;
    const prompt = i.options.getString('prompt')!;
    const pollenId = i.options.getString('model') || POLLENS.find((p) => p.defaultForTextPrompts)?.id;
    const channelName = (i.channel as GuildTextBasedChannel).name;
    logger.info(
      {
        channelName,
        prompt,
        pollenId
      },
      `Got 'Create' command`
    );

    const pollen = getPollenFromChannelName(channelName) || POLLENS.find((p) => p.id === pollenId);
    if (!pollen) {
      logger.warn({ pollenId }, 'Could not find pollen configuration');
      return await i.reply({ ephemeral: true, content: `Could not find pollen configuration with name ${pollenId}` });
    }

    const params = createParamSet(pollen, prompt);
    await i.reply('🐝');
    await executePollenAndUpdateUI(pollen, params, i, prompt);
    return true;
  }
};

export default CreateCommand;
