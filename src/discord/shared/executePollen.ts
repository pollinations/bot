import { runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import type { PollenDefinition, PollenParamValue } from '../config/pollens.js';
import { POLLINATORS } from '../config/pollinators.js';
import { downloadFiles } from '../util/downloadFiles.js';
import { extractMediaFromIpfsResponse } from '../util/extractMediaFromIpfsResponse.js';

export async function* executePollen(pollen: PollenDefinition, params: Record<string, PollenParamValue>) {
  const pollinator = POLLINATORS.find((pollinator) => pollinator.pollenId === pollen.id)!;
  console.log('Running pollen', pollen.id, 'with params', params);
  for await (const data of runModelGenerator(params, pollinator.url)) {
    console.log('got data', data);

    const output = data.output;
    const imageOutputDefinition = pollen.outputs.find((o) => o.type === 'image');
    const images = extractMediaFromIpfsResponse(output).slice(0, imageOutputDefinition?.numImages || 1);
    console.log('got images', images);

    const files = await downloadFiles(images, '.mp4');
    yield { ipfs: data, images, files };
  }
}
