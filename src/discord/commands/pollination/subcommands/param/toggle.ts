import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { Subcommand } from '../../../../config/commands.js';
import { resolveParamKeyAutoComplete } from '../../shared/resolveParamKeyAutoComplete.js';
import { toggleOrSetParam } from '../../shared/toggleOrSetParam.js';

const PollinationToggleCommand: Subcommand<ChatInputCommandInteraction> = {
  data: {
    name: 'toggle',
    description: 'Toggle a parameter',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'key',
        required: true,
        description: 'the name of the boolean parameter to toggle',
        type: ApplicationCommandOptionType.String,
        autocomplete: true
      }
    ]
  },
  autoCompleteHandler: async (interaction) => {
    return resolveParamKeyAutoComplete(interaction, 'key', (p) => p.type === 'boolean');
  },
  execute: async (interaction) => {
    // get params
    const key = interaction.options.getString('key')!;
    // toggle param
    toggleOrSetParam(interaction, key, 'toggle');
  }
};
export default PollinationToggleCommand;
