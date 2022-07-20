const {
    REST
} = require("@discordjs/rest");
const {
    Routes
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;

// register slash command

const commands = [{
    name: "ping",
    description: "Replies with Pong!",
}, ];

const rest = new REST({
    version: "10"
}).setToken(token);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(
                "916928878495277097",
                "885844321461485618"
            ), {
                body: commands
            }
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

// create bot

const {
    Client,
    GatewayIntentBits
} = require("discord.js");
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

client.on("interactionCreate", async (interaction) => {
    console.log(interaction);
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ping") {
        await interaction.reply("Pong!");
    }
});

client.on("messageCreate", (message) => {
    // return if message is by a bot
    if (message.author.bot) return;

    console.log("messageCreate", message);
    console.log("message content", message.content);
    message.react('👍');
    message.channel.send(`I'm a parrot. ${message.content}`);
});

// client.on("message", (message) => {
//     console.log("message", message);
// });

client.login(token);