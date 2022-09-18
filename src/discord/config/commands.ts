import type {
  APIApplicationCommand,
  APIApplicationCommandSubcommandOption,
  ApplicationCommandType,
  AutocompleteInteraction,
  ChatInputCommandInteraction
} from 'discord.js';
import PollinationCommand from '../commands/pollination/index.js';
import CreateCommand from '../commands/create.js';

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
export interface Command {
  data: Omit<APIApplicationCommand, 'id' | 'default_member_permissions' | 'application_id' | 'version'> & {
    type: ApplicationCommandType;
  };
  autoCompleteHandler?: (interaction: AutocompleteInteraction) => Promise<any>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
}

export interface Subcommand extends Omit<Command, 'data'> {
  data: APIApplicationCommandSubcommandOption;
}

// Register all commands to be used here
export const COMMANDS: Command[] = [CreateCommand, PollinationCommand];
