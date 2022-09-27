import { Data, runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import _ from 'lodash';
import type { PollenParamValue } from '../config/pollens.js';
import { POLLINATORS } from '../config/pollinators.js';
import { ParsedPollinationsResponse, parsePollinationsResponse } from './parsePollinationsResponse.js';
import type { Logger } from 'pino';

export type UpdateCallback = (parsedData: ParsedPollinationsResponse) => Promise<any>;

const THROTTLE_INTERVAL_IN_MS = 5000;
export async function executePollen(
  pollenId: string,
  params: Record<string, PollenParamValue>,
  logger: Logger,
  onUpdate: UpdateCallback
) {
  try {
    const pollinator = POLLINATORS.find((p) => p.pollenId === pollenId);
    if (!pollinator) throw new Error(`No pollinator found for pollenId '${pollenId}'`);
    logger.info({ pollenId, params, pollinator: pollinator.url }, 'Executing pollen');

    // throttled update of response
    const updateResponse = _.throttle(async (raw: Data) => {
      let parsed = parsePollinationsResponse(raw);
      logger.debug({ outputCid: parsed.outputCid }, 'Updating response');
      await onUpdate(parsed);
    }, THROTTLE_INTERVAL_IN_MS);

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
    throw err;
  }
}
