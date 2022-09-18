import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import type { Command } from '../../config/commands.js';
import type { PollenParamValue } from '../../config/pollens.js';
import PollinationInitCommand from './subcommands/init.js';
import PollinationParamSetCommand from './subcommands/param/set.js';
import PollinationToggleCommand from './subcommands/param/toggle.js';
import PollinationRunCommand from './subcommands/run.js';

export interface PollenParam {
  name: string;
  value: PollenParamValue;
}
export interface Pollination {
  userId?: string;
  pollenId: string;
  params: PollenParam[];
  createdAt?: number;
  status: 'running' | 'done' | 'error' | 'initialized';
}

export type PollinationStatus = Pollination['status'];

const PollinationCommand: Command = {
  data: {
    name: 'pollination',
    type: ApplicationCommandType.ChatInput,
    description: 'Configure a pollen before executing it',
    options: [
      { ...PollinationInitCommand.data, name: 'init' },
      { ...PollinationRunCommand.data, name: 'run' },

      {
        name: 'param',
        type: ApplicationCommandOptionType.SubcommandGroup,
        description: "Configure a pollen's parameters",
        options: [
          { ...PollinationParamSetCommand.data, name: 'set' },
          { ...PollinationToggleCommand.data, name: 'toggle' }
        ]
      }
    ]
  },
  autoCompleteHandler: async (interaction) => {
    const subCommandName = interaction.options.getSubcommand();
    if (subCommandName === 'init') PollinationInitCommand.autoCompleteHandler?.(interaction);
    else if (subCommandName === 'set') PollinationParamSetCommand.autoCompleteHandler?.(interaction);
    else if (subCommandName === 'toggle') PollinationToggleCommand.autoCompleteHandler?.(interaction);
  },
  execute: async (interaction) => {
    // return if not in channel
    if (!interaction.inGuild() || !interaction.channel)
      return interaction.reply({ content: 'This command can only be used in a server', ephemeral: true });

    const subCommandName = interaction.options.getSubcommand();
    if (subCommandName === 'init') PollinationInitCommand.execute(interaction);
    else if (subCommandName === 'set') PollinationParamSetCommand.execute(interaction);
    else if (subCommandName === 'toggle') PollinationToggleCommand.execute(interaction);
    else if (subCommandName === 'run') PollinationRunCommand.execute(interaction);

    return;
  }
};

export default PollinationCommand;
