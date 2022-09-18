import { COMMANDS } from '../config/commands.js';
import type { EventConfig } from '../config/events.js';

const InteractionCreateEvent: EventConfig<'interactionCreate'> = {
  debugName: 'InteractionCreateEvent',
  on: 'interactionCreate',
  execute: async (_client, interaction) => {
    // SLASH COMMAND
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName;
      console.log('incoming command', commandName);
      const command = COMMANDS.find((c) => c.data.name === commandName);
      if (!command) {
        console.log(`no chat input command found with name ${commandName}`);
        return;
      }
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    } else if (interaction.isAutocomplete()) {
      const commandName = interaction.commandName;
      console.log('incoming command', commandName);
      const command = COMMANDS.find((c) => c.data.name === commandName);
      if (!command) {
        console.log(`no chat input command found with name ${commandName}`);
        return;
      }
      try {
        interaction.commandId;
        await command.autoCompleteHandler?.(interaction);
      } catch (error) {
        console.error(error);
        return;
      }
    }
  }
};

export default InteractionCreateEvent;
