import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, userMention } from 'discord.js';
import type { Subcommand } from '../../../config/commands.js';
import { PollenParamValue, POLLENS } from '../../../config/pollens.js';
import lodash from 'lodash';
import { executePollen } from '../../../util/executePollen.js';
import { buildPollinationConfigEmbed } from '../shared/buildPollinationConfigEmbed.js';
import { exitInteraction, EXIT_REASONS } from '../shared/errorHandler.js';
import { upsertSummary } from '../shared/upsertSummary.js';
import { POLLINATORS } from '../../../config/pollinators.js';

const PollinationRunCommand: Subcommand<ChatInputCommandInteraction> = {
  data: {
    name: 'run',
    description: 'Execute an initialised pollen',
    type: ApplicationCommandOptionType.Subcommand
  },

  execute: async () => {
    throw new Error('Not implemented');
    // // retrieve state by looking up user session in session store
    // const userId = interaction.user.id;
    // const userState = interaction.client.store.users.get(userId);
    // const { currentSession } = userState;

    // if (!currentSession) return exitInteraction(interaction, EXIT_REASONS.NO_SESSION());

    // // get pollen
    // const pollen = POLLENS.find((p) => p.id === currentSession.pollenId)!;
    // if (!pollen) return exitInteraction(interaction, EXIT_REASONS.INVALID_POLLEN_ID(currentSession.pollenId));

    // // execute pollen
    // currentSession.status = 'running';
    // const params = currentSession.params.reduce(
    //   (acc, param) => ({ ...acc, [param.name]: param.value }),
    //   {} as Record<string, PollenParamValue>
    // );

    // //get pollinator
    // const pollinator = POLLINATORS.find((pollinator) => pollinator.pollenId === pollen.id)!;

    // await executePollen(pollen, params, pollinator, interaction, prompt);
    // return true;
  }
};
export default PollinationRunCommand;
