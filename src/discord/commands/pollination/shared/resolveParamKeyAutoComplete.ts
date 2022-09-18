import type { AutocompleteInteraction } from 'discord.js';
import { PollenParamDefinition, POLLENS } from '../../../config/pollens.js';

export const resolveParamKeyAutoComplete = async (
  interaction: AutocompleteInteraction,
  keyOptionKey: string = 'key',
  filter: (param: PollenParamDefinition) => boolean = () => true
) => {
  const userInput = interaction.options.getString(keyOptionKey);
  const userId = interaction.user.id;
  const { currentSession } = interaction.client.store.users.get(userId);
  if (!currentSession) return interaction.respond([]);

  const pollen = POLLENS.find((p) => p.id === currentSession.pollenId)!;
  const choices = pollen.params.filter(filter).map((paramDef) => paramDef.name);
  const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(userInput!.toLowerCase()));
  return interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};
