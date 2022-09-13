import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ChannelConfig, ChannelName, CHANNEL_CONFIG } from '../config/channels.js';
import lodash from 'lodash';
import { runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import type { EventConfig } from '../config/events.js';
import { extractMediaFromIpfsResponse } from '../util/extractMediaFromIpfsResponse.js';
import { downloadFiles } from '../util/downloadFiles.js';

const channelNames = Object.keys(CHANNEL_CONFIG);

const clickableChannelIDs = channelNames
  .map((channelName) => `<#${CHANNEL_CONFIG[channelName as ChannelName].channelId}>`)
  .join(', ');

const DmFromChannelEvent: EventConfig<'messageCreate'> = {
  debugName: 'DmFromChannelEvent',
  on: 'messageCreate',
  execute: async (client, dMessage) => {
    // return if message is by a bot
    if (dMessage.author.bot) return;

    // return if message is not a mention of the bot
    const botIDString = `<@${client.user?.id}>`;
    if (dMessage.content.indexOf(botIDString) === -1) return;

    const channel = dMessage.channel as GuildTextBasedChannel;
    const channelNameUnvalidated = (channel as GuildTextBasedChannel).name;

    if (!channelNames.includes(channelNameUnvalidated)) {
      await dMessage.react('🚫');
      await dMessage.reply(
        'This channel is not supported. Please use one of the following channels to send your prompt: ' +
          clickableChannelIDs
      );
      return;
    }

    const channelName = channelNameUnvalidated as ChannelName;
    const config = CHANNEL_CONFIG[channelName] as ChannelConfig;

    const { model, promptField } = CHANNEL_CONFIG[channelName]!;

    const prettyModelName = extractPrettyModelNameFromURL(model);
    console.log('selected model', prettyModelName);
    console.log('got message content', dMessage.content);

    dMessage.react('🐝');

    // message is either the attachment or the message interpreted as the text prompt (without the bot name)
    const message = checkAttachment(dMessage) || dMessage.content.replace(botIDString, '');

    const messageRef = await dMessage.reply(`Creating: **${message}** using model: **${prettyModelName}**.`);

    // create throttled version of the messageRef.edit() function; use it to update bot message on the client
    const editReply = lodash.throttle(messageRef.edit.bind(messageRef), 10000);

    console.log('running model generator', model, { [promptField]: message });
    const results = runModelGenerator(
      {
        [promptField]: message
      },
      model
    );

    for await (const data of results) {
      console.log('got data', data);

      const output = data.output;
      const contentID = data['.cid'];

      const images = extractMediaFromIpfsResponse(output).slice(0, config.numImages || Infinity);
      console.log('got images', images);

      const files = await downloadFiles(images, '.mp4');

      // inside a command, event listener, etc.
      const embeds = images.map(([_filename, image]) => createEmbed(prettyModelName, message, image, contentID));

      console.log('calling editReply', { embeds, files });
      await editReply({ embeds, files });
    }
  }
};
export default DmFromChannelEvent;

const extractPrettyModelNameFromURL = (modelName: string) =>
  //@ts-ignore
  modelName
    .split('/')
    .pop()
    .split('@')
    .shift()
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

function checkAttachment(dMessage: Message) {
  if (dMessage.attachments.size > 0) {
    // get attachment image url
    const { url } = dMessage.attachments.first()!;
    console.log('got attachment with url', url);
    return url;
  }
  return null;
}

function createEmbed(modelNameHumanReadable: string, messageWithoutBotName: string, image: string, contentID: string) {
  return new EmbedBuilder()
    .setDescription(`Model: **${modelNameHumanReadable}**`)
    .setTitle(messageWithoutBotName.slice(0, 250))
    .setImage(image)
    .setURL(`https://pollinations.ai/p/${contentID}`);
}
