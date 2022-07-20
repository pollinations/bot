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

client.on("messageCreate", async (dMessage) => {
    // return if message is by a bot
    if (dMessage.author.bot) return;

    const botIDString = `<@${client.user.id}>`;

    // return if message is not a mention of the bot
    if (dMessage.content.indexOf(botIDString) === -1) return;

    console.log("got message content", dMessage.content);

    dMessage.react("🐝");

    const message = dMessage.content.replace(botIDString, "");
    
    const messageRef = await dMessage.reply(`Creating. **${message}**`);
    const editFunction = lodash.throttle(arg => messageRef.edit(arg), 10000);

    const modelName = "pollinations/preset-frontpage";
    const modelNameHumanReadable = modelNameDescription(modelName);


    const results = runModel({
        Prompt: message
    }, modelName);

    for await (const data of results) {

        const output = data.output;
        const contentID = data[".cid"];


        // sometimes the image is an empty string for some reason. skip

        const images = getImages(output);

    
        // inside a command, event listener, etc.
        const embeds = images
            .map(([_filename, image]) => createEmbed(modelNameHumanReadable, message, image, contentID));

        editFunction({
            embeds
        });

    }
});

client.login(token);

const modelNameDescription = (modelName) =>
    modelName
    .split("/")
    .pop()
    .replace("-", " ")
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

    return images
}
