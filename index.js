import discordjs from "discord.js";
import {runModel} from "@pollinations/ipfs/awsModelRunner.js";
import lodash from "lodash";

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = discordjs;

const token = process.env.DISCORD_TOKEN;

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
        "model": "pollinations/min-dalle",
        "promptField": "text",
        "channelId": "999295739727466528"
    },
    "latent-diffusion": {
        "model": "pollinations/preset-frontpage",
        "promptField": "Prompt",
        "channelId": "999296010025173012"
    },
    "majesty-diffusion": {
        "model": "pollinations/majesty-diffusion-cog",
        "promptField": "text_prompt",
        "channelId": "999295785621540914"
    }
}

const channelNames = Object.keys(channels);

const clickableChannelIDs = channelNames.map((channelName) => `<#${channels[channelName].channelId}>`).join(", ");


client.on("messageCreate", async (dMessage) => {
    // return if message is by a bot
    if (dMessage.author.bot) return;

    const channelName = dMessage.channel.name;

    if (!channelNames.includes(channelName)) {
        await dMessage.react("🚫");
        await dMessage.reply("This channel is not supported. Please use one of the following channels to send your prompt: " + clickableChannelIDs);
        return;
    }

    const { model, promptField } = channels[channelName];
    const prettyModelName = modelNameDescription(model);

    console.log("selected model", prettyModelName);
    const botIDString = `<@${client.user.id}>`;

    // return if message is not a mention of the bot
    if (dMessage.content.indexOf(botIDString) === -1) return;

    console.log("got message content", dMessage.content);

    dMessage.react("🐝");

  
    const message = dMessage.content.replace(botIDString, "");
    
    const messageRef = await dMessage.reply(`Creating: **${message}** using model: **${prettyModelName}**.`);
    const editReply = lodash.throttle(arg => messageRef.edit(arg), 10000);



    const results = runModel({
        [promptField]: message
    }, model);

    for await (const data of results) {

        const output = data.output;
        const contentID = data[".cid"];

        const images = getImages(output)
    
        // inside a command, event listener, etc.
        const embeds = images
            .map(([_filename, image]) => createEmbed(prettyModelName, message, image, contentID));

        editReply({
            embeds
        });

    }
});

client.login(token);

const modelNameDescription = (modelName) =>
    modelName
    .split("/")
    .pop()
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

    return images.slice(-4);
}
