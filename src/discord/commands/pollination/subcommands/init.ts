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
    const userId = interaction.user.id;
    console.log('init', userId);

    // get command options
    const pollenId = interaction.options.getString('model')!;
    const resetFlag = interaction.options.getBoolean('reset')!;
    const promptUserInput = interaction.options.getString('prompt')!;

    // get pollen definition
    const pollen = POLLENS.find((p) => p.id === pollenId)!;

    // check if configuration of previous can be used for this FOR THIS POLLEN
    const userState = interaction.client.store.users.get(userId);

    let prevPollination = userState.prevSessions[pollenId];
    if (prevPollination && prevPollination.pollenId !== pollenId) prevPollination = undefined;

    // initialize params for pollination
    const params: PollenParam[] = pollen.params.map((param) => {
      if (resetFlag)
        return {
          name: param.name,
          value: param.defaultValue
        };
      else {
        const prevParam = prevPollination?.params.find((p) => p.name === param.name);
        return {
          name: param.name,
          value: prevParam?.value || param.defaultValue
        };
      }
    });

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
        }
      }
    }

    interaction.reply(
      `Initializing pollination configuration. You can \`/set\` or \`/toggle\` params, or  re-\`/init\` or \`/run\` the pollination.`
    );

    // initialize pollination object
    const pollination: Pollination = { userId, pollenId, params, createdAt: Date.now(), status: 'initialized' };

    // build embed with default param settings
    const { summaryEmbed } = buildPollinationConfigEmbed(pollination);
    const summaryMessage = await interaction.channel!.send({
      embeds: [summaryEmbed]
    });

    // save session
    userState.textPromptHistory = userState.textPromptHistory.slice(-3).concat(promptUserInput);
    interaction.client.store.users.update(userId, {
      currentSession: pollination,
      currentSummary: summaryMessage,
      textPromptHistory
    });
    return;
  }
};

export default PollinationInitCommand;
