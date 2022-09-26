import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  MessageActionRowComponentBuilder
} from 'discord.js';
import { POLLENS } from '../../../config/pollens.js';
import { isPrimaryPromptParam } from '../../../util/promptParamHandling.js';
import type { Pollination, PollinationStatus } from '../index.js';

const STATUS_COLORS: Record<PollinationStatus, ColorResolvable> = {
  initialized: 'Blue',
  running: 'Yellow',
  done: 'Green',
  error: 'Red'
};

export const buildPollinationConfigEmbed = (pollination: Pollination) => {
  const { pollenId, params, status } = pollination;
  const pollen = POLLENS.find((pollen) => pollen.id === pollenId)!;
  const primaryPromptParam = pollen.params.find(isPrimaryPromptParam)!;
  const promptParam = params.find((p) => p.name === primaryPromptParam.name)!;
  const summaryEmbed = new EmbedBuilder()
    .setTitle(pollen.displayName)
    .setURL('https://pollinations.ai')
    .setAuthor({
      name: 'pollinations.ai',
      iconURL: 'https://pollinations.ai/favicon-32x32.png',
      url: 'https://pollinations.ai'
    })
    .setDescription(pollen.description || 'Configure your pollen before executing it')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields([{ name: promptParam.name, value: (promptParam.value || '').toString() }])
    .setColor(STATUS_COLORS[status])
    .addFields([{ name: 'Status', value: status }])

    .addFields(
      params
        .filter((p) => p.name !== primaryPromptParam.name)
        .map(({ name, value }) => {
          return { name, value: value === undefined ? '<not set>' : value.toString(), inline: true };
        })
    );
  const executeButton = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder().setCustomId('pollination:execute').setLabel('Run Pollen!').setStyle(ButtonStyle.Success)
  );
  return { summaryEmbed, executeButton };
};
