import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import type { Command } from '../config/commands.js';
import { PollenParamDefinition, POLLENS } from '../config/pollens.js';
import { isPrimaryPromptParam } from '../util/promptParamHandling.js';
import lodash from 'lodash';
import { parseModalFieldsAsParams } from '../util/discord.js/parseModalFieldsAsParams.js';
import botTexts from '../config/botTexts.js';
const MODAL_ID = 'parameter-prototype';

const ModalCommand: Command<ChatInputCommandInteraction> = {
  data: {
    name: 'modal',
    type: ApplicationCommandType.ChatInput,
    description: 'Prototype to test fine tuning model parameters',
    options: [
      {
        name: 'prompt',
        type: ApplicationCommandOptionType.String,
        description: 'the prompt to imagine',
        required: true
      },
      {
        name: 'model',
        required: false,
        description: 'the model to use',
        type: ApplicationCommandOptionType.String,
        choices: POLLENS.filter((p) => p.prototype).map(({ id, model, displayName }) => ({
          name: displayName || model,
          value: id
        }))
      }
    ]
  },
  execute: async (interaction) => {
    const prompt = interaction.options.getString('prompt')!;
    const pollenId = interaction.options.getString('model')!;
    const pollen = POLLENS.find((p) => p.id === pollenId)!;

    // BUILD MODAL
    const modal = new ModalBuilder().setCustomId(MODAL_ID).setTitle(pollen.displayName);

    // Sort by xOrder; number of ActionRows in Modal limited to 5
    // https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals:~:text=in%20this%20section.-,%23,-Building%20and%20responding
    const availableParams = pollen.params.filter(isTextBasedParam).sort(sortParamsAscByXOrder).slice(0, 5);

    availableParams.forEach((param) => {
      const input = new TextInputBuilder().setCustomId(param.name).setLabel(param.displayName || param.name);
      const defaultValue = param.defaultValue?.toString() || '';

      if (isPrimaryPromptParam(param)) {
        input
          .setStyle(TextInputStyle.Paragraph)
          .setValue(prompt || defaultValue)
          .setRequired(true);
      } else {
        input
          .setStyle(TextInputStyle.Short)
          .setValue(defaultValue)
          .setRequired(param.required || false);
      }

      const row = new ActionRowBuilder<any>().addComponents(input);
      modal.addComponents(row);
    });

    // show modal and await response
    await interaction.showModal(modal);
    const submitted = await interaction
      .awaitModalSubmit({
        time: 120000,
        filter: (i) => i.user.id === interaction.user.id && i.customId === MODAL_ID
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
    if (!submitted) return null;

    const params = parseModalFieldsAsParams(submitted, availableParams);

    submitted.reply('Your request has been accepted!');

    const result = await interaction!.channel!.send(botTexts.onExecutionStart(prompt, pollen.displayName));
    const updateResultMessage = lodash.throttle(result.edit.bind(result), 10000);

    // for await (const data of executePollen(pollen, params)) {
    //   const { files, images, ipfs } = data;
    //   const contentID = ipfs['.cid'];
    //   const embeds = images.map(([_filename, image]) => createEmbed(pollen.displayName!, prompt, image, contentID));
    //   updateResultMessage({ embeds, files });
    // }
    return;
  }
};

export default ModalCommand;

const isTextBasedParam = (a: PollenParamDefinition) => ['number', 'text'].includes(a.type);
const sortParamsAscByXOrder = (a: PollenParamDefinition, b: PollenParamDefinition) =>
  (typeof a.xOrder === 'number' ? a.xOrder : Infinity) - (typeof b.xOrder === 'number' ? b.xOrder : Infinity);
