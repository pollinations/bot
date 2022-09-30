import { Data, runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import _ from 'lodash';
import type { PollenParamValue } from '../config/pollens.js';
import { POLLINATORS } from '../config/pollinators.js';
import { ParsedPollinationsResponse, parsePollinationsResponse } from './parsePollinationsResponse.js';
import type { Logger } from 'pino';

export type UpdateCallback = (parsedData: ParsedPollinationsResponse) => Promise<any>;
const SESSION_TIMEOUT_IN_MS = 1000 * 60 * 30; // 20 minutes
const THROTTLE_INTERVAL_IN_MS = 5000;
export async function executePollen(
  pollenId: string,
  params: Record<string, PollenParamValue>,
  logger: Logger,
  onUpdate: UpdateCallback
) {
  return new Promise(async (resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined;

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
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          reject(new Error('TIMEOUT'));
        }, SESSION_TIMEOUT_IN_MS);

        counter = counter + 1;
        // input cid on first response
        if (raw.output?.success === false) throw Error('Failed pollen');
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
      resolve(true);
    } catch (err) {
      reject(err);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  });
}
let t;
