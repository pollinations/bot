import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { ERROR_MESSAGES } from '../../../config/botTexts.js';
import type { Subcommand } from '../../../config/commands.js';
import { PollenParamValue, POLLENS } from '../../../config/pollens.js';
import lodash from 'lodash';
import { executePollen } from '../../../shared/executePollen.js';
import { buildPollinationConfigEmbed } from '../shared/buildPollinationConfigEmbed.js';

const PollinationRunCommand: Subcommand = {
  data: {
    name: 'run',
    description: 'Execute an initialised pollen',
    type: ApplicationCommandOptionType.Subcommand
  },

  execute: async (interaction) => {
    // retrieve state by looking up user session in session store
    const userId = interaction.user.id;
    const { currentSession, currentSummary } = interaction.client.store.users.get(userId);
    console.log('run', userId);

    if (!currentSession || !currentSummary)
      return interaction.reply({ content: ERROR_MESSAGES.NO_SESSION(), ephemeral: true });

    // get pollen
    const pollen = POLLENS.find((p) => p.id === currentSession.pollenId)!;

    // execute pollen
    await interaction.reply({ content: 'Executing pollen...', ephemeral: true });
    try {
      const updateResultMessage = lodash.throttle(currentSummary.edit.bind(currentSummary), 5000);

      // create param dictionary for pollinations API
      const params = currentSession.params.reduce(
        (acc, param) => ({ ...acc, [param.name]: param.value }),
        {} as Record<string, PollenParamValue>
      );

      currentSession.status = 'running';
      for await (const data of executePollen(pollen, params)) {
        const { files, images, ipfs } = data;
        const contentID = ipfs['.cid'];
        const { summaryEmbed } = buildPollinationConfigEmbed(currentSession);
        const resultEmbeds = images.map((image) =>
          new EmbedBuilder().setImage(image[1]).setURL(`https://pollinations.ai/p/${contentID}`)
        );
        updateResultMessage({ embeds: [summaryEmbed, ...resultEmbeds], files });
      }
      currentSession.status = 'done';
      return;
    } catch (error) {
      console.log(error);
      return interaction.channel!.send({ content: 'Error executing pollen' });
    }
  }
};
export default PollinationRunCommand;
