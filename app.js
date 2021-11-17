/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : remindcord/app.js
Description  : Initializes nodejs
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

// Packages and configuration - - - - - - - - - - - - - - - - - - - - - - - - -
// Declare packages
const express = require("express");
const bodyParser = require("body-parser");
const dataStore = require('data-store');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
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
const devices_storage = new dataStore({path: './devices.json'});
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
let send_startup_msg = true;

// When the bot is connected and ready, update console
bot.on('ready', () => {
    // Set bot status
    bot.editStatus("online");
    // Send update to console
    spinner.succeed('Connected to Discord API');
    spinner.succeed(`${chalk.blue.bold('Remindcord')} listening for ${chalk.yellow('API')} and ${chalk.cyan('Discord')} events`);
    // Send connected bot message
    if (send_startup_msg) {
        bot.createMessage(config_storage.get('discord_bot_channel'), ":white_check_mark: **Remindcord: System Online**");
        send_startup_msg = false;
    }
});

// Every time a message is created in the Discord server
bot.on('messageCreate', async (msg) => {
    // Only respond to message if in correct channel
    if (msg.channel.id === config_storage.get('discord_bot_channel')) {
        // Get Discord prefix
        let pre = config_storage.get('discord_bot_prefix');
        // Split message into components
        let parts = msg.content.split(' ');
        // Determine if we received a command
        if (parts[0] === pre + 'help') { //  If we receive the help command, display all Remindcord commands
            spinner.start(`${chalk.cyan('Discord')}: Sending message to "` + pre + `help" command`);
            // Send message to Discord channel, catch error if thrown
            try {
                await msg.channel.createMessage('**Remindcord commands**\n' +
                    '> ' + pre + 'help: Displays all Remindcord commands\n' +
                    '> ' + pre + 'status: Returns more details from the last alert\n' +
                    '> ' + pre + 'devices: Returns all known devices\n' +
                    '> ' + pre + 'details <device_id>: Returns all details for a Particle device_id\n' +
                    '> ' + pre + 'alert_freq <device_id> <freq_in_min>: Sets the alert frequency in terms of minutes for a device, use 0 for verbose alerts\n' +
                    '> ' + pre + 'name <device_id> <friendly_name>: Changes the friendly name for a Particle device_id\n');
                spinner.succeed(`${chalk.cyan('Discord')}: Sent message to "` + pre + `help" command`);
            } catch (err) {
                spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
            }
        } else if (parts[0]=== pre + 'status') { //  If we receive the status command, return more details from the last alert
            spinner.start(`${chalk.cyan('Discord')}: Sending message to "` + pre + `status" command`);
            // Send message to Discord channel, catch error if thrown
            try {
                if (devices_storage.get('last_alert_device_id') === '') {
                    await msg.channel.createMessage('Please wait for an alert to occur');
                } else {
                    await msg.channel.createMessage(get_status(devices_storage.get('last_alert_device_id')));
                }
                spinner.succeed(`${chalk.cyan('Discord')}: Sent message to "` + pre + `status" command`);
            } catch (err) {
                spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                console.log(err);
            }
        } else if (parts[0]=== pre + 'devices') { //  If we receive the devices command, return all known devices
            spinner.start(`${chalk.cyan('Discord')}: Sending message to "` + pre + `devices" command`);
            let devices_payload = "";
            let all_devices = JSON.parse(devices_storage.json(null, 2));
            for (let i in all_devices) {
                if (all_devices.hasOwnProperty(i) && i !== "last_alert_device_id") {
                    devices_payload += '> ' + i + ' | ' + all_devices[i].device_name + ' | ' + moment(all_devices[i].last_data_update).format('h:mm:ss a [on] MM/DD/YY Z [UTC]') + '\n';
                }
            }
            // Send message to Discord channel, catch error if thrown
            try {
                await msg.channel.createMessage('**Devices** (device_id | friendly_name | last_data_update)\n' + devices_payload);
                spinner.succeed(`${chalk.cyan('Discord')}: Sent message to "` + pre + `devices" command`);
            } catch (err) {
                spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                console.log(err);
            }
        } else if (parts[0] === pre + 'details') { //  If we receive the details command, return all details for a Particle device_id
            spinner.start(`${chalk.cyan('Discord')}: Sending message to "` + pre + `details" command`);
            // Send message to Discord channel, catch error if thrown
            try {
                await msg.channel.createMessage(get_status(parts[1]));
                spinner.succeed(`${chalk.cyan('Discord')}: Sent message to "` + pre + `details" command`);
            } catch (err) {
                spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                console.log(err);
            }
        } else if (parts[0] === pre + 'alert_freq') { //  If we receive the alert_freq command, set the alert frequency in terms of minutes for a device
            // Make sure device_id exists
            if (devices_storage.has(parts[1]) && parts[1] !== undefined) {
                let device = devices_storage.get(parts[1]);
                // Check to make sure the freq_in_min value is valid
                if (parts[2] >= 0) {
                    // Update device data
                    devices_storage.set(parts[1], {
                        device_name: device.device_name,
                        data: device.data,
                        last_data_update: device.last_data_update,
                        last_alert_update: device.last_alert_update,
                        alert_freq_min: parts[2]
                    });
                    spinner.info(`${chalk.cyan('Discord')}: (id:` + parts[1] + `) Updated alert_freq to ` + parts[2] + ` for device due to "` + pre + `alert_freq" command`);
                    // Send message to Discord channel, catch error if thrown
                    try {
                        await msg.channel.createMessage(device.device_name + ' (' + parts[1] + ') will now send alerts at a maximum of every ' + parts[2] + ' mins');
                    } catch (err) {
                        spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                        console.log(err);
                    }
                } else {
                    spinner.fail(`${chalk.cyan('Discord')}: <freq_in_min> must be greater than or equal to 0, responding with error`);
                    // Send message to Discord channel, catch error if thrown
                    try {
                        await msg.channel.createMessage('ERROR: <freq_in_min> must be greater than or equal to 0, check ' + pre + 'help');
                    } catch (err) {
                        spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                        console.log(err);
                    }
                }
            } else {
                spinner.fail(`${chalk.cyan('Discord')}: <device_id> does not exist, responding with error`);
                // Send message to Discord channel, catch error if thrown
                try {
                    await msg.channel.createMessage('ERROR: Particle <device_id> does not exist in database');
                } catch (err) {
                    spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                    console.log(err);
                }
            }
        } else if (parts[0] === pre + 'name') { // If we receive the name command, change the friendly name for a Particle device_id
            // Make sure device_id exists
            if (devices_storage.has(parts[1]) && parts[1] !== undefined) {
                let device = devices_storage.get(parts[1]);
                // Update device data
                devices_storage.set(parts[1], {
                    device_name: parts[2],
                    data: device.data,
                    last_data_update: device.last_data_update,
                    last_alert_update: device.last_alert_update,
                    alert_freq_min: device.alert_freq_min
                });
                spinner.info(`${chalk.cyan('Discord')}: (id:` + parts[1] + `) Updated device_name to ` + parts[2] + ` for device due to "` + pre + `name" command`);
                // Send message to Discord channel, catch error if thrown
                try {
                    await msg.channel.createMessage(parts[2] + ' (' + parts[1] + ') was successfully renamed');
                } catch (err) {
                    spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                    console.log(err);
                }
            } else {
                spinner.fail(`${chalk.cyan('Discord')}: <device_id> does not exist, responding with error`);
                // Send message to Discord channel, catch error if thrown
                try {
                    await msg.channel.createMessage('ERROR: Particle <device_id> does not exist in database');
                } catch (err) {
                    spinner.fail(`${chalk.cyan('Discord')}: Failed to send message`);
                    console.log(err);
                }
            }
        }
        // Else, do nothing and ignore message
    }
});

// Create a prettified status message for Discord
function get_status(device_id) {
    if (devices_storage.has(device_id)) {
        let device = devices_storage.get(device_id);
        return '**Device Details: ' + device.device_name + ' **(' + device_id + ')\n' +
            '> Batt Level | ' + device.data.loc.batt + "%\n" +
            '> Cell Strength | ' + device.data.loc.cell + '%\n' +
            '> Event Trigger | ' + device.data.trig + '\n' +
            '> GPS Coords | Lat: ' + device.data.loc.lat + ', ' +
            'Long: ' + device.data.loc.lon + '\n' +
            '> GPS Accuracy | Vert: ' + device.data.loc.v_acc + " m, " +
            'Hori: ' + device.data.loc.h_acc + " m\n" +
            '> Altitude | ' + device.data.loc.alt + " m\n" +
            '> Heading | ' + device.data.loc.hd + "°\n" +
            '> Temp | ' + (Math.round(((device.data.loc.temp*(9/5))+32)*100)/100) + "°F\n" +
            '> Last Heard | ' + moment(device.last_data_update).format('h:mm:ss a [on] MM/DD/YY Z [UTC]') + "\n" +
            '> Alert Frequency | At most every ' + device.alert_freq_min + " mins\n" +
            ' http:// maps.apple.com/maps?q=' + device.data.loc.lat + ',' + device.data.loc.lon + '\n';
    } else {
        return 'ERROR: Particle <device_id> does not exist in database'
    }
}

// Handle any errors that the bot encounters
bot.on('error', err => {
    console.warn(err);
});
// End of Discord integration - - - - - - - - - - - - - - - - - - - - - - - - -