import type { Data } from '@pollinations/ipfs/awsPollenRunner.js';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.mpg', '.mpeg'];

export const parsePollinationsResponse = (raw: Data) => {
  const { output } = raw;
  const { success } = output;
  const cid = raw['.cid'];
  // filter out non-image outputs
  const images = Object.entries(output).filter(
    ([key, value]) => IMAGE_EXT.some((ext) => key.endsWith(ext)) && typeof value === 'string'
  ) as [string, string][];
  const videos = Object.entries(output).filter(
    ([key, value]) => VIDEO_EXT.some((ext) => key.endsWith(ext)) && typeof value === 'string'
  ) as [string, string][];

  return {
    cid,
    images,
    videos,
    success
  };
};
