import { runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import type { PollenDefinition, PollenParamValue } from '../config/pollens';
import { POLLINATORS } from '../config/pollinators';
import { downloadFiles } from '../util/downloadFiles';
import { extractMediaFromIpfsResponse } from '../util/extractMediaFromIpfsResponse';

export async function* executePollen(pollen: PollenDefinition, params: Record<string, PollenParamValue>) {
  const pollinator = POLLINATORS.find((pollinator) => pollinator.pollenId === pollen.id)!;
  console.log('Running pollen', pollen.id, 'with params', params);
  for await (const data of runModelGenerator(params, pollinator.url)) {
    console.log('got data', data);

    const output = data.output;

    const images = extractMediaFromIpfsResponse(output).slice(0, 1);
    console.log('got images', images);

    const files = await downloadFiles(images, '.mp4');
    yield { ipfs: data, images, files };
  }
}
