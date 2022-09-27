import { AttachmentBuilder, ColorResolvable, EmbedBuilder } from 'discord.js';
import { downloadFile } from '../downloadFile.js';
import type { ParsedPollinationsResponse } from '../parsePollinationsResponse.js';

const STATUS = {
  0: {
    color: 'Blue',
    label: 'initialized'
  },
  1: {
    color: 'Yellow',
    label: 'in progress'
  },
  2: {
    color: 'Green',
    label: 'done'
  },
  3: {
    color: 'Red',
    label: 'error'
  }
};
export type PollinationStatus = keyof typeof STATUS;

const ICON_URL = 'https://pollinations.ai/favicon-32x32.png';
const AUTHOR = {
  name: 'pollinations.ai',
  iconURL: ICON_URL,
  url: 'https://pollinations.ai'
};

const buildEmbedUrl = (cid?: string) => (cid ? `https://pollinations.ai/p/${cid}` : null);

export const buildDefaultResponsePayload = (
  title: string,
  data?: ParsedPollinationsResponse,
  prompt?: string,
  status: keyof typeof STATUS = 0
) => {
  const url = buildEmbedUrl(data?.outputCid);
  const mainEmbed = buildMainEmbed(title, url, prompt, status);
  const imageEmbeds =
    data?.images
      .slice(-9)
      .reverse()
      .map(([_, imageUrl]) => createImageEmbed(title, imageUrl, url)) || [];

  return { mainEmbed, imageEmbeds };
};

export const buildMainEmbed = (
  title: string,
  url: string | null,
  prompt?: string,
  statusCode: keyof typeof STATUS = 0
) => {
  let status = STATUS[statusCode];
  const promptValue = prompt && (prompt.length > 1024 ? prompt.slice(0, 1021) + '...' : prompt);
  // const imageLinks =
  //   images && images.length > 0 ? images.map(([_, url], index) => `[${index + 1}](${url})`).join(', ') : '-';
  const eb = new EmbedBuilder()
    .setTitle(title || 'Your Pollination')
    .setURL(url)
    .setAuthor(AUTHOR)
    .setColor(status.color as ColorResolvable)
    .setFooter({ text: 'Powered by pollinations.ai', iconURL: ICON_URL });
  if (promptValue) eb.addFields([{ name: 'Prompt', value: promptValue }]);
  eb.addFields([{ name: 'Status', value: status.label, inline: true }]).setTimestamp();
  return eb;
};
export function createImageEmbed(title: string, imageUrl: string, url: string | null) {
  return new EmbedBuilder().setTitle(title.slice(0, 250)).setImage(imageUrl).setURL(url);
}

export const createVideoAttachments = async (videos: [string, string][] = []) => {
  return Promise.all([...videos.map(downloadFile)]);
};
