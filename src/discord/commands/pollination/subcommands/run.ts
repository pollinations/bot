import { ApplicationCommandOptionType, EmbedBuilder, userMention } from 'discord.js';
import type { Subcommand } from '../../../config/commands.js';
import { PollenParamValue, POLLENS } from '../../../config/pollens.js';
import lodash from 'lodash';
import { executePollen } from '../../../shared/executePollen.js';
import { buildPollinationConfigEmbed } from '../shared/buildPollinationConfigEmbed.js';
import logger from '../../../logger.js';
import { exitInteraction, EXIT_REASONS } from '../shared/errorHandler.js';
import { upsertSummary } from '../shared/upsertSummary.js';

const PollinationRunCommand: Subcommand = {
  data: {
    name: 'run',
    description: 'Execute an initialised pollen',
    type: ApplicationCommandOptionType.Subcommand
  },

  execute: async (interaction) => {
    // retrieve state by looking up user session in session store
    const userId = interaction.user.id;
    const userState = interaction.client.store.users.get(userId);
    const { currentSession } = userState;

    if (!currentSession) return exitInteraction(interaction, EXIT_REASONS.NO_SESSION());

    // get pollen
    const pollen = POLLENS.find((p) => p.id === currentSession.pollenId)!;
    if (!pollen) return exitInteraction(interaction, EXIT_REASONS.INVALID_POLLEN_ID(currentSession.pollenId));

    // execute pollen
    await interaction.reply({ content: 'Executing pollen...', ephemeral: true });
    currentSession.status = 'running';
    const { summaryEmbed } = buildPollinationConfigEmbed(currentSession);
    let newSummary = await upsertSummary(interaction, { embeds: [summaryEmbed] }, userState.currentSummary);
    interaction.client.store.users.update(userId, { currentSession, currentSummary: newSummary });
    const updateResultMessage = lodash.throttle(newSummary.edit.bind(newSummary), 5000);
    try {
      // create param dictionary for pollinations API
      const params = currentSession.params.reduce(
        (acc, param) => ({ ...acc, [param.name]: param.value }),
        {} as Record<string, PollenParamValue>
      );

      for await (const data of executePollen(pollen, params)) {
        const { files, images, ipfs } = data;
        const contentID = ipfs['.cid'];
        const { summaryEmbed } = buildPollinationConfigEmbed(currentSession);
        const resultEmbeds = images.map((image) =>
          new EmbedBuilder().setImage(image[1]).setURL(`https://pollinations.ai/p/${contentID}`)
        );
        newSummary = await updateResultMessage({ embeds: [summaryEmbed, ...resultEmbeds], files })!;
        interaction.client.store.users.update(userId, { currentSummary: newSummary });
      }
      currentSession.status = 'done';
      interaction.client.store.users.update(userId, { currentSession, currentSummary: newSummary });

      return;
    } catch (error) {
      currentSession.status = 'error';
      const { summaryEmbed } = buildPollinationConfigEmbed(currentSession);
      newSummary = await updateResultMessage({ embeds: [summaryEmbed] })!;
      interaction.client.store.users.update(userId, { currentSession, currentSummary: newSummary });
      return false;
    }
  }
};
export default PollinationRunCommand;
