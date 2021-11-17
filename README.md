# Remindcord
[![Build Status](https://travis-ci.org/RAK3RMAN/remindcord.svg?branch=main)](https://travis-ci.org/RAK3RMAN/remindcord)
![Language](https://img.shields.io/badge/language-Node.js-informational.svg?style=flat)

A Discord bot that sends a repeatable message on a defined interval

## Purpose

## Install
As easy as 1, 2, 3.
1. Clone the repo and enter the directory: ``git clone https://github.com/rak3rman/remindcord.git && cd remindcord``
2. Install packages: ``npm install``
2. Run project: ``npm run start``

## Usage
### Configuration
After the first run of Remindcord, a config file will be created in the config folder with path ``/config.json``.
This file stores all the environment variables needed for the project, which can be edited when the instance is not running.
The config file will be populated with the following default values:
- ``"discord_bot_token": "random_string_generated_here"``
- ``"discord_bot_channel": "discord_channel_here"``
- ``"discord_bot_prefix": "!"`` The character that the Discord bot listens to. ! is the default, so !help will display the commands.

**NOTE:** Make sure to stop the instance of Remindcord before changing any of these values. If the file is modified while an instance is active, the changes will be overridden.

### Running the project
The npm package supports multiple ways to run the project.
- ``npm run start`` Runs the project, plain and simple.
- ``npm run develop`` Starts the project and watches for all file changes. Restarts the instance if critical files are updated. Must have nodemon installed.
- ``npm run test`` Runs a few tests for Travis-CI. Nothing crazy here.

Use ``^C`` to exit any of these instances. Currently, there are no exit commands or words.

### Remindcord commands

### Development
The framework behind this project is not new in the slightest. In fact, [many articles](https://www.section.io/engineering-education/discord-bot-node/) describe how to make a Discord bot using Node.js and explain the basics better than I can. If you'd like to make a Discord bot yourself I would highly suggest checking out these resources.

## Contributors
- **Radison Akerman** / Project Lead

*Individual contributions are listed on most functions*

## License
This project (Remindcord) is protected by the Mozilla Public License 2.0 as disclosed in the [LICENSE](https://github.com/rak3rman/remindcord/blob/main/LICENSE). Adherence to the policies and terms listed is required.