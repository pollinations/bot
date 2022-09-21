import { ApplicationCommandOptionType } from 'discord.js';
import type { Subcommand } from '../../../config/commands.js';
import { POLLENS } from '../../../config/pollens.js';
import { isPrimaryPromptParam } from '../../../util/promptParamHandling.js';
import type { PollenParam, Pollination } from '../index.js';
import { buildPollinationConfigEmbed } from '../shared/buildPollinationConfigEmbed.js';

// throws an error when creating autocomplete when larger
const MAX_LENGTH_PROMPT_HISTORY_ITEM = 100;

const PollinationInitCommand: Subcommand = {
  data: {
    name: 'init',
    description: 'Initialize a pollen configuration',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'model',
        required: true,
        description: 'the pollen to use',
        type: ApplicationCommandOptionType.String,
        choices: POLLENS.filter((p) => p.prototype).map(({ id, model, displayName }) => ({
          name: displayName || model,
          value: id
        }))
      },
      {
        name: 'prompt',
        description: 'Leave blank to use prompt from previous session with this pollen',
        type: ApplicationCommandOptionType.String,
        autocomplete: true
      },
      {
        name: 'reset',
        description: 'If set to true, will reset the pollen configuration instead of re-using your previous one',
        type: ApplicationCommandOptionType.Boolean
      }
    ]
  },
  autoCompleteHandler: async (interaction) => {
    const userInput = interaction.options.getString('prompt');
    const userId = interaction.user.id;
    const { textPromptHistory } = interaction.client.store.users.get(userId);
    const filtered = textPromptHistory.filter((prevPrompt) =>
      prevPrompt.toLowerCase().startsWith(userInput!.toLowerCase())
    );
    return interaction.respond(
      filtered.map((prevPrompt) => {
        const value = prevPrompt.slice(0, MAX_LENGTH_PROMPT_HISTORY_ITEM);
        return { name: value, value };
      })
    );
  },
  execute: async (interaction) => {
    const { logger } = interaction;
    const userId = interaction.user.id;

    // get command options
    const pollenId = interaction.options.getString('model')!;
    const resetFlag = interaction.options.getBoolean('reset')!;
    const promptUserInput = interaction.options.getString('prompt')!;

    // get pollen definition
    const pollen = POLLENS.find((p) => p.id === pollenId);
    if (!pollen) {
      // this should (almost) never happenl, since the autocomplete should prevent it
      logger.warn(`Invalid pollen id: ${pollenId}`, { pollenId });
      return interaction.reply({ content: `'${pollenId} is not a valid pollen id`, ephemeral: true });
    }
    logger.debug(`Initializing pollen: ${pollenId} (${pollen.displayName})`, { pollenId });

    // check if configuration of previous can be used for this FOR THIS POLLEN
    const userState = interaction.client.store.users.get(userId);

    let prevPollinationForPollen = userState.prevSessions[pollenId];
    logger.debug(`${prevPollinationForPollen ? 'Valid' : 'No'} previous configuration found`);

    // initialize params for pollination
    logger.debug(`Initializing param set, reset: ${resetFlag ? 'true' : 'false'}`);
    const params: PollenParam[] = pollen.params.map((param) => {
      if (resetFlag)
        return {
          name: param.name,
          value: param.defaultValue
        };
      else {
        const prevParam = prevPollinationForPollen?.params.find((p) => p.name === param.name);
        return {
          name: param.name,
          value: prevParam?.value || param.defaultValue
        };
      }
    });
    logger.debug(`Param set initialized \n${params.map((p) => `${p.name}: ${p.value}`).join('\n')}`);

    // handle prompt param input from user
    let textPromptHistory = userState.textPromptHistory;
    if (promptUserInput) {
      const primaryPromptParamDefinition = pollen.params.find(isPrimaryPromptParam);
      const primaryPromptParam = params.find((p) => p.name === primaryPromptParamDefinition?.name);
      if (primaryPromptParam) {
        // override initial prompt from user input, if given
        primaryPromptParam.value = promptUserInput;
        // add to history
        if (!textPromptHistory.includes(promptUserInput) && promptUserInput.length <= 100) {
          textPromptHistory = [...textPromptHistory.slice(-9), promptUserInput];
          logger.debug(`Added prompt to user's prompt history: '${promptUserInput}'`, { prompt: promptUserInput });
        }
      }
    }
    //@ts-ignore
    delete interaction.logger;
    await interaction.reply(
      `Initializing pollination configuration. You can \`/set\` or \`/toggle\` params, or  re-\`/init\` or \`/run\` the pollination.`
    );

    // initialize pollination object
    const pollination: Pollination = { userId, pollenId, params, createdAt: Date.now(), status: 'initialized' };

    const { summaryEmbed } = buildPollinationConfigEmbed(pollination);
    const summaryMessage = await interaction.channel!.send({
      embeds: [summaryEmbed]
    });
    logger.debug('Sent pollination configuration embed');

    // save session
    interaction.client.store.users.update(userId, {
      currentSession: pollination,
      currentSummary: summaryMessage,
      textPromptHistory
    });
    return;
  }
};

export default PollinationInitCommand;
