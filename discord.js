import discordjs from "discord.js";
import {runModelGenerator} from "@pollinations/ipfs/awsPollenRunner.js";
import lodash from "lodash";
import credentials from "./credentials.js";
import fetch from "node-fetch";
import fs from "fs";

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = discordjs;




const token = credentials.discord_token;

// create bot

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        //        GatewayIntentBits.MessageContent
    ],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const channels = {
    "dalle-mini": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/min-dalle",
        "promptField": "Prompt",
        "channelId": "999295739727466528"
    },
    "latent-diffusion": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage",
        "promptField": "Prompt",
        "channelId": "999296010025173012"
    },
    "majesty-diffusion": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog",
        "promptField": "Prompt",
        "channelId": "999295785621540914",
        "numImages": 1
    },
    "disco-diffusion": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/disco-diffusion",
        "promptField": "prompt",
        "channelId": "1003013847562592306",
        "numImages": 1
    },
    "photo3d": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/adampi",
        "promptField": "image",
        "channelId": "1007030609060823082",
        "numImages": 1
    },
    'retrieval-diffusion': {
      model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/latent-diffusion-400m',
      promptField: 'prompt',
      channelId: '1009168983578124449',
      numImages: 1
    },
    'stable-diffusion': {
      model: '614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private',
      promptField: 'prompts',
      channelId: '1011335962007175198',
      numImages: 4
    }
}

const channelNames = Object.keys(channels);

const clickableChannelIDs = channelNames.map((channelName) => `<#${channels[channelName].channelId}>`).join(", ");


client.on("messageCreate", async (dMessage) => {
    // return if message is by a bot

    if (dMessage.author.bot) return;

    const channelName = dMessage.channel.name;

    const channel = channels[channelName];

    const botIDString = `<@${client.user.id}>`;

    // return if message is not a mention of the bot
    if (dMessage.content.indexOf(botIDString) === -1) return;


    if (!channelNames.includes(channelName)) {
        await dMessage.react("🚫");
        await dMessage.reply("This channel is not supported. Please use one of the following channels to send your prompt: " + clickableChannelIDs);
        return;
    }

    if (!channels[channelName]) 
        return;

    const { model, promptField } = channels[channelName];
    const prettyModelName = modelNameDescription(model);

    console.log("selected model", prettyModelName);

    
    console.log("got message content", dMessage.content);

    dMessage.react("🐝");

    // check if message has attachments
    const attachment = checkAttachment(dMessage);

    // message is either the attachment or the message interpreted as the text prompt (without the bot name)
    const message = attachment || dMessage.content.replace(botIDString, "");
    
    const messageRef = await dMessage.reply(`Creating: **${message}**`);
    const editReply = lodash.throttle((...args) => messageRef.edit(...args), 10000);

    console.log("running model generator", model, { [promptField]: message });
    const results = runModelGenerator({
        [promptField]: message
    }, model);

    for await (const data of results) {
        console.log("got data", data);

        const output = data.output;
        const contentID = data[".cid"];

        const images = getImages(output).slice(0, channel.numImages || Infinity);

        console.log("got images", images);
        
        const files = await Promise.all(images
            .filter(([filename, _url]) => filename.endsWith(".mp4"))
            .map(async ([filename, url]) => {
                console.log("fetching url", url);
                const response = await fetch(url);
                const buffer = await response.buffer();
                // write to local filesystem
                const filePath = `/tmp/${filename}`;
                fs.writeFileSync(filePath, buffer);  
                console.log("wrote file", filePath);   
                return filePath           
            }))
        
        // inside a command, event listener, etc.
        const embeds = images
            .map(([_filename, image]) => createEmbed(prettyModelName, message, image, contentID));

        console.log("calling editReply", { embeds, files });
        await editReply({ embeds, files });

    }

});

client.login(token);

const modelNameDescription = (modelName) =>
    modelName
    .split("/")
    .pop()
    .split("@")
    .shift()
    .replaceAll("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());


function checkAttachment(dMessage, attachment) {
    if (dMessage.attachments.size > 0) {
        // get attachment image url
        const { url } = dMessage.attachments.first();
        console.log("got attachment with url", url);
        return url;
    }
    return null
}

function createEmbed(modelNameHumanReadable, messageWithoutBotName, image, contentID) {
    return new EmbedBuilder()
        .setDescription(`Model: **${modelNameHumanReadable}**`)
        .setTitle(messageWithoutBotName.slice(0,250))
        .setImage(image)
        .setURL(`https://pollinations.ai/p/${contentID}`);
}

function getImages(output) {
    if (!output)
	return []
    const outputEntries = Object.entries(output);

    const images = outputEntries.filter(([filename, url]) => (filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".mp4")) && url.length > 0);

    return lodash.reverse(images.slice(-4));
}
