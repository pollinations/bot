import { ApplicationCommandOptionType } from 'discord.js';
import type { Subcommand } from '../../../config/commands.js';
import { POLLENS } from '../../../config/pollens.js';
import { isPrimaryPromptParam } from '../../../util/promptParamHandling.js';
import type { PollenParam, Pollination } from '../index.js';
import { buildPollinationConfigEmbed } from '../shared/buildPollinationConfigEmbed.js';
import { exitInteraction, EXIT_REASONS } from '../shared/errorHandler.js';
import { upsertSummary } from '../shared/upsertSummary.js';

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

    // this should (almost) never happenl, since the autocomplete should prevent it
    if (!pollen) return exitInteraction(interaction, EXIT_REASONS.INVALID_POLLEN_ID(pollenId), 'warn');

    logger.debug({ pollenId }, `Initializing pollen: ${pollenId} (${pollen.displayName})`);

    // send initial response
    await interaction.reply({
      content: 'Initializing pollen, please wait...',
      ephemeral: true
    });

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
        // try to find previous value for this param
        const prevParam = prevPollinationForPollen?.params.find((p) => p.name === param.name);
        return {
          name: param.name,
          value: prevParam?.value || param.defaultValue
        };
      }
    });
    logger.debug({ params }, `Param set initialized`);

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
          logger.debug({ prompt: promptUserInput }, `Added prompt to user's prompt history'`);
        }
      }
    }

    // initialize pollination object
    const pollination: Pollination = { userId, pollenId, params, createdAt: Date.now(), status: 'initialized' };

    // send response
    const { summaryEmbed } = buildPollinationConfigEmbed(pollination);
    const messagePayload = {
      embeds: [summaryEmbed],
      content: `You can \`/set\` or \`/toggle\` params, or  re-\`/init\` or \`/run\` the pollination.`
    };

    let newSummary = await upsertSummary(interaction, messagePayload, userState.currentSummary);

    // await newSummary.pin();
    logger.debug('Sent pollination configuration embed');

    // save session
    userState.prevSessions[pollenId] = pollination;
    interaction.client.store.users.update(userId, {
      ...userState,
      currentSession: pollination,
      currentSummary: newSummary,
      textPromptHistory
    });
    return true;
  }
};

export default PollinationInitCommand;
