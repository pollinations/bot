import { Data, runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import { ChatInputCommandInteraction, Message, MessagePayload } from 'discord.js';
import _ from 'lodash';
import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import type { Pollinator } from '../config/pollinators.js';
import { ParsedPollinationsResponse, parsePollinationsResponse } from './parsePollinationsResponse.js';

export type ResponsePayloadBuilder = (
  parsedData: ParsedPollinationsResponse | undefined,
  on: 'init' | 'error' | 'update' | 'success'
) => Promise<MessagePayload | false>;

export async function executePollen(
  pollen: PollenDefinition,
  params: Record<string, PollenParamValue>,
  pollinator: Pollinator,
  msgOrInteraction: Message | ChatInputCommandInteraction,
  responsePayloadBuilder: ResponsePayloadBuilder
) {
  const { logger } = msgOrInteraction;

  // defined outside so we can keep achieved progress when sending error
  let response: Message | undefined;
  let data: ParsedPollinationsResponse | undefined;
  try {
    logger.info({ pollenId: pollen.id, params, pollinator: pollinator.url }, 'Executing pollen');

    // initial response
    const payload = await responsePayloadBuilder(undefined, 'init');
    if (payload) {
      if (msgOrInteraction instanceof Message) response = await msgOrInteraction.reply(payload);
      else response = await msgOrInteraction.channel?.send(payload);
    }

    // throttled update of response
    const updateResponse = _.throttle(async (raw: Data) => {
      data = parsePollinationsResponse(raw);
      logger.debug({ outputCid: data.outputCid }, 'Updating response');

      const payload = await responsePayloadBuilder(data, 'update');
      if (payload) await response?.edit(payload);
    }, 5000);

    // main execution loop
    let counter = 0;
    let outputCidLogged = false;
    for await (const raw of runModelGenerator(params, pollinator.url)) {
      counter = counter + 1;
      // input cid on first response
      if (counter === 1) logger.info({ inputCid: raw.input_cid }, 'Got first response. IPFS Input is set up');
      if (!outputCidLogged && raw['.cid']) {
        // log outputCid only once as soon as it is available
        outputCidLogged = true;
        logger.info({ outputCid: raw['.cid'] }, 'Pollination started');
      }
      logger.debug(`[it ${counter}]: received data from backend`);
      await updateResponse(raw);
    }

    logger.info({ iterations: counter }, 'Pollination finished successfully');
    return;
  } catch (err) {
    logger.error(err, 'Unhandled exception while executing event');
    if (response) {
      // error response
      const payload = await responsePayloadBuilder(data, 'error');
      if (payload) await response.edit(payload);
    }
  }
}
