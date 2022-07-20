
import discordjs from "discord.js";
import runModel from '@pollinations/ipfs/awsModelRunner.js';

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

    message.react('👍');

    const messageWithoutBotName = message.content.replace(botIDString, "");
    console.log("messageWithoutBotName", messageWithoutBotName);
    message.channel.send(`Rendering. **${messageWithoutBotName}**`);
    
    const results = await runModel({Prompt: messageWithoutBotName}, "pollinations/preset-frontpage");
    console.log("dalleResults",results)
    // inside a command, event listener, etc.
    const exampleEmbed = new EmbedBuilder()
    .setImage(results);
    message.channel.send({embeds: [exampleEmbed]});

});

client.login(token);