import type { ChatInputCommandInteraction } from 'discord.js';
import { ERROR_MESSAGES } from '../../../config/botTexts.js';
import { PollenParamValue, POLLENS } from '../../../config/pollens.js';
import type { Pollination } from '../index.js';
import { buildPollinationConfigEmbed } from './buildPollinationConfigEmbed.js';
import { parsePollenParamValue } from './parsePollenParamValue.js';

export const toggleOrSetParam = async (
  interaction: ChatInputCommandInteraction,
  key: string,
  value: PollenParamValue | 'toggle'
) => {
  // retrieve state by looking up user session in session store
  const userId = interaction.user.id;
  const { currentSession, currentSummary } = interaction.client.store.users.get(userId);

  if (!currentSession) return interaction.reply({ content: ERROR_MESSAGES.NO_SESSION(), ephemeral: true });
  // get pollen
  const pollen = POLLENS.find((p) => p.id === currentSession.pollenId)!;

  // get param
  const paramDefintion = pollen.params.find((p) => p.name === key);
  if (!paramDefintion) return interaction.reply({ content: `No parameter with name \`${key}\``, ephemeral: true });

  // actually update the param
  let parsedValue = undefined;
  let params = undefined;
  try {
    params = currentSession.params.map((p) => {
      if (p.name !== key) return p;
      else {
        console.log(paramDefintion.type, value);

        if (paramDefintion.type === 'boolean' && value === 'toggle') parsedValue = !p.value;
        else parsedValue = parsePollenParamValue(value, paramDefintion);
        return { name: p.name, value: parsedValue };
      }
    });
  } catch (error: any) {
    return interaction.reply({ content: error, ephemeral: true });
  }

  // update session
  const update: Pollination = { ...currentSession, params };
  interaction.client.store.users.update(userId, { currentSession: update });

  // send confirmation
  await interaction.reply({
    content: `Parameter \`${key}\` set to \`${parsedValue}\``,
    ephemeral: true
  });

  // update summary view
  const { executeButton, summaryEmbed } = await buildPollinationConfigEmbed(update);
  if (interaction.channel!.id === currentSummary?.channel.id) {
    currentSummary.edit({ embeds: [summaryEmbed], components: [executeButton] });
  } else {
    const summary = await interaction.channel!.send({ embeds: [summaryEmbed] });
    interaction.client.store.users.update(userId, { currentSummary: summary });
    currentSummary?.edit({ content: 'Configuration has moved away from this channel' });
  }
  return;
};
