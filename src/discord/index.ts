import 'dotenv/config';
import discordjs, { GuildTextBasedChannel } from 'discord.js';
import { runModelGenerator } from '@pollinations/ipfs/awsPollenRunner.js';
import lodash from 'lodash';

const { Client, GatewayIntentBits, EmbedBuilder } = discordjs;

const token = process.env['DISCORD_TOKEN'];

// create botx

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
    //        GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

const CHANNEL_CONFIG = {
  'dalle-mini': {
    model:
      '614871946825.dkr.ecr.us-east-1.amazonaws.com/voodoohop/dalle-playground',
    promptField: 'prompt',
    channelId: '999295739727466528'
  },
  'latent-diffusion': {
    model:
      '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage',
    promptField: 'Prompt',
    channelId: '999296010025173012'
  },
  'majesty-diffusion': {
    model:
      '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog',
    promptField: 'Prompt',
    channelId: '999295785621540914',
    numImages: 1
  },
  'disco-diffusion': {
    model:
      '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/disco-diffusion',
    promptField: 'prompt',
    channelId: '1003013847562592306',
    numImages: 1
  }
};
type ChannelName = keyof typeof CHANNEL_CONFIG;

const channelNames = Object.keys(CHANNEL_CONFIG);

const clickableChannelIDs = channelNames
  .map(
    (channelName) =>
      `<#${CHANNEL_CONFIG[channelName as ChannelName].channelId}>`
  )
  .join(', ');

client.on('messageCreate', async (dMessage) => {
  // return if message is by a bot

  if (dMessage.author.bot) return;
  const channel = dMessage.channel as GuildTextBasedChannel;
  const channelNameUnvalidated = (channel as GuildTextBasedChannel).name;

  if (channelNames.includes(channelNameUnvalidated)) return;

  const channelName = channelNameUnvalidated as ChannelName;
  const config = CHANNEL_CONFIG[channelName];

  const botIDString = `<@${client.user?.id}>`;

  // return if message is not a mention of the bot
  if (dMessage.content.indexOf(botIDString) === -1) return;

  if (!channelNames.includes(channelName)) {
    await dMessage.react('🚫');
    await dMessage.reply(
      'This channel is not supported. Please use one of the following channels to send your prompt: ' +
        clickableChannelIDs
    );
    return;
  }

  const { model, promptField } = CHANNEL_CONFIG[channelName];
  const prettyModelName = modelNameDescription(model);

  console.log('selected model', prettyModelName);

  console.log('got message content', dMessage.content);

  dMessage.react('🐝');

  const message = dMessage.content.replace(botIDString, '');

  const messageRef = await dMessage.reply(
    `Creating: **${message}** using model: **${prettyModelName}**.`
  );
  const editReply = lodash.throttle((arg) => messageRef.edit(arg), 10000);

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

    //@ts-ignore
    const images = getImages(output).slice(0, config.numImages || Infinity);

    // inside a command, event listener, etc.
    const embeds = images.map(([_filename, image]) =>
      createEmbed(prettyModelName, message, image, contentID)
    );

    await editReply({
      embeds
    });
  }
});

client.login(token);

const modelNameDescription = (modelName: string) =>
  //@ts-ignore
  modelName
    .split('/')
    .pop()
    .split('@')
    .shift()
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

function createEmbed(
  modelNameHumanReadable: string,
  messageWithoutBotName: string,
  image: string,
  contentID: string
) {
  return new EmbedBuilder()
    .setDescription(`Model: **${modelNameHumanReadable}**`)
    .setTitle(messageWithoutBotName.slice(0, 250))
    .setImage(image)
    .setURL(`https://pollinations.ai/p/${contentID}`);
}

function getImages(output: any) {
  const outputEntries = Object.entries(output) as [string, string][];

  const images = outputEntries.filter(
    ([filename, url]) =>
      (filename.endsWith('.png') || filename.endsWith('.jpg')) && url.length > 0
  );

  return lodash.reverse(images.slice(-4));
}
