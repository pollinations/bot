import discordjs from "discord.js";
import {runModelGenerator} from "@pollinations/ipfs/awsPollenRunner.js";
import lodash from "lodash";
import credentials from "./credentials.js";
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
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/voodoohop/dalle-playground",
        "promptField": "prompt",
        "channelId": "999295739727466528"
    },
    "latent-diffusion": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/preset-frontpage",
        "promptField": "Prompt",
        "channelId": "999296010025173012"
    },
    "majesty-diffusion": {
        "model": "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/majesty-diffusion-cog",
        "promptField": "text_prompt",
        "channelId": "999295785621540914",
        "numImages": 1
    },
    "disco-diffusion": {
        "model": "r8.im/nightmareai/disco-diffusion@sha256:cc730cf65f83d7ffed2aa6d47bc9a538b628617be5a4c2db27e7aee6a6391920",
        "promptField": "prompt",
        "channelId": "1003013847562592306",
        "numImages": 1
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
    
    //return if promt is empty
    if(dMessage.content.replace(botIDString, "").replace(/\s/g, "")) return;


    if (!channelNames.includes(channelName)) {
        await dMessage.react("🚫");
        await dMessage.reply("This channel is not supported. Please use one of the following channels to send your prompt: " + clickableChannelIDs);
        return;
    }

    const { model, promptField } = channels[channelName];
    const prettyModelName = modelNameDescription(model);

    console.log("selected model", prettyModelName);

    
    console.log("got message content", dMessage.content);

    dMessage.react("🐝");

  
    const message = dMessage.content.replace(botIDString, "");
    
    const messageRef = await dMessage.reply(`Creating: **${message}** using model: **${prettyModelName}**.`);
    const editReply = lodash.throttle(arg => messageRef.edit(arg), 10000);


    console.log("running model generator", model, { [promptField]: message });
    const results = runModelGenerator({
        [promptField]: message
    }, model);

    for await (const data of results) {
        console.log("got data", data);

        const output = data.output;
        const contentID = data[".cid"];

        const images = getImages(output).slice(0, channel.numImages || Infinity);


    
        // inside a command, event listener, etc.
        const embeds = images
            .map(([_filename, image]) => createEmbed(prettyModelName, message, image, contentID));

        await editReply({
            embeds
        });

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

function createEmbed(modelNameHumanReadable, messageWithoutBotName, image, contentID) {
    return new EmbedBuilder()
        .setDescription(`Model: **${modelNameHumanReadable}**`)
        .setTitle(messageWithoutBotName)
        .setImage(image)
        .setURL(`https://pollinations.ai/p/${contentID}`);
}

function getImages(output) {
    const outputEntries = Object.entries(output);

    const images = outputEntries.filter(([filename, url]) => (filename.endsWith(".png") || filename.endsWith(".jpg")) && url.length > 0);

    return lodash.reverse(images.slice(-4));
}
