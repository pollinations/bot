import type { APIApplicationCommand, ChatInputCommandInteraction } from 'discord.js';
import ImagineCommand from '../commands/imagine';
import TestCommand from '../commands/test';

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
export interface Command {
  data: Omit<APIApplicationCommand, 'id' | 'default_member_permissions' | 'application_id' | 'version'>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// Register all commands to be used here
export const COMMANDS: Command[] = [ImagineCommand, TestCommand];
