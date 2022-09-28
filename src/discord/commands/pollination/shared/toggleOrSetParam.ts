import type { ChatInputCommandInteraction } from 'discord.js';
import { PollenParamValue, POLLENS } from '../../../config/pollens.js';
import type { Pollination } from '../index.js';
import { buildPollinationConfigEmbed } from './buildPollinationConfigEmbed.js';
import { exitInteraction, ExitReason, EXIT_REASONS } from './errorHandler.js';
import { parsePollenParamValue } from './parsePollenParamValue.js';
import { upsertSummary } from './upsertSummary.js';

export const toggleOrSetParam = async (
  interaction: ChatInputCommandInteraction,
  key: string,
  value: PollenParamValue | 'toggle'
) => {
  const { logger } = interaction;
  // retrieve state by looking up user session in session store
  const userId = interaction.user.id;
  const { currentSession, currentSummary } = interaction.client.store.users.get(userId);

  if (!currentSession) return exitInteraction(interaction, EXIT_REASONS.NO_SESSION());
  // get pollen
  const pollen = POLLENS.find((p) => p.id === currentSession.pollenId)!;

  // get param
  const paramDefintion = pollen.params.find((p) => p.name === key);
  if (!paramDefintion) return exitInteraction(interaction, EXIT_REASONS.INVALID_PARAM_KEY(key));

  // actually update the param
  let parsedValue = undefined;

  let params;
  try {
    params = currentSession.params.map((p) => {
      if (p.name !== key) return p;
      else {
        if (paramDefintion.type === 'boolean' && value === 'toggle') parsedValue = !p.value;
        else parsedValue = parsePollenParamValue(value, paramDefintion);
      }
      return { name: p.name, value: parsedValue };
    });
  } catch (exitReason) {
    return exitInteraction(interaction, exitReason as ExitReason);
  }
  console.debug({ params, key, parsedValue }, `Updated param set`);

  const update: Pollination = { ...currentSession, params };

  // send confirmation
  await interaction.reply({
    content: `Parameter \`${key}\` set to \`${parsedValue}\``,
    ephemeral: true
  });

  // update summary view
  const { summaryEmbed } = await buildPollinationConfigEmbed(update);
  const newSummary = await upsertSummary(interaction, { embeds: [summaryEmbed] }, currentSummary);

  // update session
  interaction.client.store.users.update(userId, { currentSession: update, currentSummary: newSummary });
  return;
};
