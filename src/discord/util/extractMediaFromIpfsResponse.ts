import lodash from 'lodash';

export function extractMediaFromIpfsResponse(output: any): [string, string][] {
  const outputEntries = Object.entries(output) as [string, string][];
  const images = outputEntries.filter(
    ([filename, url]) =>
      url.length > 0 && (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.mp4'))
  );

  return lodash.reverse(images.slice(-4));
}
