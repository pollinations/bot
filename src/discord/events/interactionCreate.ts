import { exitInteraction, EXIT_REASONS } from '../commands/pollination/shared/errorHandler.js';
import { COMMANDS } from '../config/commands.js';
import type { EventConfig } from '../types/misc.js';

// interactionCreate event handles slash commands, context menus, and message components
const InteractionCreateEvent: EventConfig<'interactionCreate'> = {
  debugName: 'InteractionCreateEvent',
  on: 'interactionCreate',
  execute: async (interaction) => {
    const { logger } = interaction;
    if (interaction.user.bot) {
      logger.debug('Ignoring interaction from bot');
      return;
    }
    if (!(interaction.isAutocomplete() || interaction.isChatInputCommand())) {
      logger.debug('Interaction is not a command, ignoring');
      return;
    }

    const { commandName } = interaction;
    const isAutocomplete = interaction.isAutocomplete();
    const subCommandName =
      (isAutocomplete || interaction.isChatInputCommand()) && interaction.options.getSubcommand(false);

    const command = COMMANDS.find((c) => c.data.name === commandName);

    // this should never happen as commands need to be registered with discord before they can be used

    if (!command) return exitInteraction(interaction, EXIT_REASONS.INVALID_COMMAND(commandName), 'error');

    if (interaction.isChatInputCommand()) {
      interaction.logger.info({ commandName, subCommandName }, `Executing command: '${subCommandName || commandName}'`);
      return command.execute(interaction);
    } else if (isAutocomplete) {
      interaction.logger.info(
        { commandName, subCommandName },
        `Executing autocomplete for command: '${subCommandName || commandName}'`
      );
      return command.autoCompleteHandler?.(interaction);
    } else {
      logger.debug('Interaction is neither ChatInputCommand, nor AutoComplete, ignoring');
      return;
    }
  }
};

export default InteractionCreateEvent;
