import { ERROR_MESSAGES } from '../config/botTexts.js';
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
    if (!interaction.isCommand()) {
      logger.debug('Interaction is not a command, ignoring');
      return;
    }

    const { commandName } = interaction;
    const isAutocomplete = interaction.isAutocomplete();
    const subCommandName =
      (isAutocomplete || interaction.isChatInputCommand()) && interaction.options.getSubcommand(false);
    interaction.logger.info({ commandName, subCommandName, isAutocomplete }, `Executing command: '${commandName}'`);

    const command = COMMANDS.find((c) => c.data.name === commandName);
    if (!command) {
      // this should never happen as commands need to be registered with discord before they can be used
      interaction.reply({ content: ERROR_MESSAGES.SERVER_ERROR(), ephemeral: true });
      logger.error(`Requested command found with name ${commandName}, which is not registered`);
      return;
    }

    if (interaction.isChatInputCommand()) return command.execute(interaction);
    else if (interaction.isAutocomplete()) return command.autoCompleteHandler?.(interaction);
    else {
      logger.debug('Interaction is neither ChatInputCommand, nor AutoComplete, ignoring');
      return;
    }
  }
};

export default InteractionCreateEvent;
