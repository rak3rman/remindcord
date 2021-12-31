/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : remindcord/app.js
Description  : Initializes nodejs
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages and configuration - - - - - - - - - - - - - - - - - - - - - - - - -
// Declare packages
const dataStore = require('data-store');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const moment = require('moment');
require('eris-embed-builder');
const eris = require('eris');
const chalk = require('chalk');
const pkg = require('./package.json');
const ora = require('ora');
const spinner = ora('');

// Print header to console
console.log(chalk.blue.bold('\nRemindcord v' + pkg.version + ' | ' + pkg.author));
console.log(chalk.white('--> Description: ' + pkg.description));
console.log(chalk.white('--> Github: ' + pkg.homepage + '\n'));

// Setup config.json and devices.json database
spinner.start('Checking configuration values');
const config_storage = new dataStore({path: './config.json'});
const msg_storage = new dataStore({path: './messages.json'});
let invalid_config = false;

// Config value: discord_bot_token
if (!config_storage.has('discord_bot_token') || config_storage.get('discord_bot_token') === '') {
    config_storage.set('discord_bot_token', '');
    spinner.fail('Please configure the "discord_bot_token" value in config.json');
    invalid_config = true;
}

// Config value: discord_bot_channel
if (!config_storage.has('discord_bot_channel') || config_storage.get('discord_bot_channel') === '') {
    config_storage.set('discord_bot_channel', '');
    spinner.fail('Please configure the "discord_bot_channel" value in config.json');
    invalid_config = true;
}


// Exit if the config values are not set properly (and not in testing env)
if (invalid_config && (process.env.testENV || process.argv[2] !== "test")) {
    process.exit(1);
} else {
    spinner.succeed('Config values have been propagated');
}
// End of Packages and configuration - - - - - - - - - - - - - - - - - - - - - -

// Discord integration - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Create a new client instance with eris
const bot = new eris.Client(config_storage.get('discord_bot_token'));

// When the bot is connected and ready, update console
bot.on('ready', () => {
    // Set bot status
    bot.editStatus("online");
    // Send update to console
    spinner.succeed('Connected to Discord API');
    spinner.succeed(`${chalk.blue.bold('Remindcord')} listening for ${chalk.cyan('Discord')} events`);
});

// Schedule to post a reminder every Sunday morning
cron.schedule('0 0 * * 0', post_reminder);

// Whenever we want to post a reminder
async function post_reminder() {
    try {
        let embed = bot.createEmbed(config_storage.get('discord_bot_channel'));
        embed.title("**:muscle: Weekly Workout Tracker**");
        embed.description(":calendar: Week of " + moment().startOf('week').format("M/DD/YY") + " -> " + moment().endOf('week').format("M/DD/YY"))
        embed.color("3447003");
        embed.footer("Release v" + pkg.version);
        let event = new Date();
        embed.timestamp(event.toISOString());
        let msg = await embed.send();
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "1️⃣");
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "2️⃣");
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "3️⃣");
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "4️⃣");
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "5️⃣");
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "6️⃣");
        await bot.addMessageReaction(config_storage.get('discord_bot_channel'), msg.id, "7️⃣");
    } catch (err) {
        spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
        console.log(err);
    }
}

// Handle any errors that the bot encounters
bot.on('error', err => {
    console.warn(err);
});

bot.connect();
// End of Discord integration - - - - - - - - - - - - - - - - - - - - - - - - -