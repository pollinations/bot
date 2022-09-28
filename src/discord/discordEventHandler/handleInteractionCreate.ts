import type { ClientEvents } from 'discord.js';
import { exitInteraction, EXIT_REASONS } from '../commands/pollination/shared/errorHandler.js';
import { COMMANDS } from '../config/commands.js';

// interactionCreate event handles slash commands, context menus, and message components
export const handleInteractionCreate = async (...args: ClientEvents['interactionCreate']) => {
  const [interaction] = args;
  const { logger } = interaction;

  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return logger.debug('Ignoring interaction');

  const { commandName } = interaction;
  const subCommandName = interaction.options.getSubcommand(false);
  const command = COMMANDS.find((c) => c.data.name === commandName);
  const commandPath = subCommandName ? `${commandName} -> ${subCommandName}` : commandName;
  // this should never happen as commands need to be registered with discord before they can be used
  if (!command) return exitInteraction(interaction, EXIT_REASONS.INVALID_COMMAND(commandName), 'error');

  if (interaction.isChatInputCommand()) {
    logger.info({ commandName, subCommandName }, `Executing command ChatInputCommand:${commandPath}`);
    return command.execute(interaction);
  } else if (interaction.isAutocomplete()) {
    logger.info({ commandName, subCommandName }, `Executing autocomplete handler: ${commandPath}`);
    return command.autoCompleteHandler?.(interaction);
  }
};
