import { ApplicationCommandOptionType } from 'discord.js';
import type { Subcommand } from '../../../../config/commands.js';
import { resolveParamKeyAutoComplete } from '../../shared/resolveParamKeyAutoComplete.js';
import { toggleOrSetParam } from '../../shared/toggleOrSetParam.js';

const PollinationParamSetCommand: Subcommand = {
  data: {
    name: 'set',
    description: 'Update a parameter',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'key',
        required: true,
        description: 'the name of the parameter to update',
        type: ApplicationCommandOptionType.String,
        autocomplete: true
      },
      {
        name: 'value',
        required: true,
        description: 'the value to attribute to the parameter',
        type: ApplicationCommandOptionType.String
      }
    ]
  },
  autoCompleteHandler: resolveParamKeyAutoComplete,
  execute: async (interaction) => {
    // get params
    const key = interaction.options.getString('key')!;
    const value = interaction.options.getString('value')!;
    toggleOrSetParam(interaction, key, value);
  }
};
export default PollinationParamSetCommand;

// UTILS
