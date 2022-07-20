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

client.on("messageCreate", async (message) => {
    // return if message is by a bot
    if (message.author.bot) return;

    const botIDString = `<@${client.user.id}>`;

    // return if message is not a mention of the bot
    if (message.content.indexOf(botIDString) === -1) return;

    console.log("got message content", message.content);

    message.react("🐝");

    const messageWithoutBotName = message.content.replace(botIDString, "");
    
    const messageRef = await message.channel.send(`Creating. **${messageWithoutBotName}**`);

    const editFunction = lodash.throttle(arg => messageRef.edit(arg), 10000);

    console.log("messageRef", messageRef);

    const modelName = "pollinations/preset-frontpage";

    const modelNameHumanReadable = modelNameDescription(modelName);


    const results = runModel({
        Prompt: messageWithoutBotName
    }, modelName);

    for await (const data of results) {

        const output = data.output;
        const contentID = data[".cid"];

        const firstImage = getFirstImage(output);


        // sometimes the iamge is an empty string for some reason. skip
        if (firstImage && (firstImage.length > 0)) {
     
            console.log("firstImage", firstImage);
            // inside a command, event listener, etc.
            const embed = new EmbedBuilder()
                .setDescription(`Model: **${modelNameHumanReadable}**`)
                .setTitle(messageWithoutBotName)
                .setImage(firstImage)
                .setURL(`https://pollinations.ai/p/${contentID}`);

            editFunction({
                embeds: [embed]
            });
        }
    }
});

client.login(token);

const modelNameDescription = (modelName) =>
    modelName
    .split("/")
    .pop()
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

function getFirstImage(output) {
    const outputEntries = Object.entries(output);

    const images = outputEntries.filter(([filename, _]) => filename.endsWith(".png") || filename.endsWith(".jpg"));

    const firstImage = images[0] && images[0][1];
    return firstImage;
}
