import { Data, runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import { ChatInputCommandInteraction, Interaction, InteractionResponse, Message } from 'discord.js';
import _ from 'lodash';
import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import type { Pollinator } from '../config/pollinators.js';
import { buildMainEmbed, buildResponseEmbeds } from './discord.js/embeds.js';
import { parsePollinationsResponse } from './parsePollinationsResponse.js';

export async function executePollen(
  pollen: PollenDefinition,
  params: Record<string, PollenParamValue>,
  pollinator: Pollinator,
  msgOrInteraction: Message | ChatInputCommandInteraction,
  prompt?: string
) {
  const { logger } = msgOrInteraction;

  // defined outside so we can keep achieved progress when sending error
  let response: Message | undefined;
  let images: [string, string][] = [];
  let outputCid: string | undefined;
  try {
    logger.info({ pollenId: pollen.id, params, pollinator: pollinator.url }, 'Executing pollen');

    const embed = buildMainEmbed(pollen.displayName, null, prompt);

    if (msgOrInteraction instanceof Message)
      response = await msgOrInteraction.reply({
        embeds: [embed]
      });
    else response = await msgOrInteraction.channel?.send({ embeds: [embed] });

    // throttled update of results
    const updateResponse = _.throttle(async (raw: Data) => {
      const data = parsePollinationsResponse(raw);
      logger.debug({ outputCid: data.cid }, 'Updating response');
      images = data.images;

      const status = data.success ? 2 : 1;
      const { mainEmbed, imageEmbeds } = buildResponseEmbeds(pollen.displayName, prompt, images, outputCid!, status);

      return response!.edit({
        embeds: [mainEmbed, ...imageEmbeds]
      });
    }, 5000);

    // main execution loop
    let counter = 0;
    let outputCidLogged = false;
    for await (const raw of runModelGenerator(params, pollinator.url)) {
      counter = counter++;
      outputCid = raw['.cid'];
      if (counter === 1) logger.info({ inputCid: raw.input_cid }, 'Got first response. IPFS Input is set up');
      if (!outputCidLogged && outputCid) {
        outputCidLogged = true;
        logger.info({ outputCid }, 'Pollination started');
      }
      logger.debug(`[it ${counter}]: received data from backend`);

      await updateResponse(raw);
    }
    logger.info({ iterations: counter }, 'Pollination finished successfully');
    return;
  } catch (err) {
    logger.error(err, 'Unhandled exception while executing event');
    if (response) {
      const { mainEmbed, imageEmbeds } = buildResponseEmbeds(pollen.displayName, prompt, images, outputCid, 3);
      response.edit({ embeds: [mainEmbed, ...imageEmbeds] });
    }
  }
}
