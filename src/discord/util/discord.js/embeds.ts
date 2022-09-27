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

const buildEmbedUrl = (cid?: string) => cid && `https://pollinations.ai/p/${cid}`;

export const buildDefaultResponsePayload = (options: MainEmbedOptions, data?: ParsedPollinationsResponse) => {
  const url = buildEmbedUrl(data?.outputCid);
  const mainEmbed = buildMainEmbed({ ...options, url });
  const imageEmbeds =
    data?.images
      .slice(-9)
      .reverse()
      .map(([_, imageUrl]) => createImageEmbed(options.title, imageUrl, url)) || [];

  return { mainEmbed, imageEmbeds };
};
export interface MainEmbedOptions {
  title: string;
  url?: string | undefined;
  prompt: string | undefined;
  statusCode?: keyof typeof STATUS;
  thumbnailUrl?: string | undefined;
  description?: string | undefined;
}
export const buildMainEmbed = (options: MainEmbedOptions) => {
  const { title, url, description, prompt, statusCode = 0, thumbnailUrl } = options;
  let status = STATUS[statusCode];
  const promptValue = prompt && (prompt.length > 1024 ? prompt.slice(0, 1021) + '...' : prompt);
  // const imageLinks =
  //   images && images.length > 0 ? images.map(([_, url], index) => `[${index + 1}](${url})`).join(', ') : '-';
  const eb = new EmbedBuilder()
    .setTitle(title || 'Your Pollination')
    .setURL(url || null)
    // .setDescription(description || null)
    .setAuthor(AUTHOR)
    // .setThumbnail(thumbnailUrl || null)
    .setColor(status.color as ColorResolvable)
    .setFooter({ text: 'Powered by pollinations.ai', iconURL: ICON_URL });
  if (promptValue) eb.addFields([{ name: 'Prompt', value: promptValue }]);
  eb.addFields([{ name: 'Status', value: status.label, inline: true }]).setTimestamp();
  return eb;
};
export function createImageEmbed(title: string, imageUrl: string, url?: string) {
  return new EmbedBuilder()
    .setTitle(title.slice(0, 250))
    .setImage(imageUrl)
    .setURL(url || null);
}

export const createVideoAttachments = async (videos: [string, string][] = []) => {
  return Promise.all([...videos.map(downloadFile)]);
};
