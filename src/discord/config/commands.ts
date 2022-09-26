import type {
  APIApplicationCommand,
  APIApplicationCommandSubcommandOption,
  ApplicationCommandType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction
} from 'discord.js';
import PollinationCommand from '../commands/pollination/index.js';
import CreateCommand from '../commands/create/index.js';

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
export interface Command<InteractionType extends Interaction> {
  data: Omit<APIApplicationCommand, 'id' | 'default_member_permissions' | 'application_id' | 'version'> & {
    type: ApplicationCommandType;
  };
  autoCompleteHandler?: (interaction: AutocompleteInteraction) => Promise<any>;
  execute: (interaction: InteractionType) => Promise<any>;
}

export interface Subcommand<InteractionType extends Interaction> extends Omit<Command<InteractionType>, 'data'> {
  data: APIApplicationCommandSubcommandOption;
}

// Register all commands to be used here
export const COMMANDS: Command<any>[] = [CreateCommand, PollinationCommand];
