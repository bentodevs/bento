const config = require("../../config");
const settings = require("../../database/models/settings");
const { getChannel, getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "ignore",
        aliases: [],
        usage: "ignore [channel | role]",
        examples: ["ignore #commands", "ignore moderator", "ignore moderator+"],
        description: "Manage what roles or channels are ignored by the automatic moderation features.",
        category: "Settings",
        info: `The bot will always ignore those with the permission \`ADMINISTRATOR\` permission.
        This commnand works as a toggle, run it again with the same role/channel and you will removed it.`,
        options: []
    },
    perms: {
        permission: "ADMINISTRATOR",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "view",
            type: "SUB_COMMAND",
            description: "View the ignore settings."
        }, {
            name: "role",
            type: "SUB_COMMAND",
            description: "Add/remove roles to/from the ignore list.",
            options: [{
                name: "role",
                type: "ROLE",
                description: "The role you want to add/remove.",
                required: true
            }, {
                name: "hierarchic",
                type: "BOOLEAN",
                description: "Wether or not the settings should apply to all roles above the specified role.",
                required: false
            }]
        }, {
            name: "channel",
            type: "SUB_COMMAND",
            description: "Add/remove channels to/from the ignore list.",
            options: [{
                name: "channel",
                type: "CHANNEL",
                description: "The channel you want to add/remove.",
                required: true
            }]
        }]
    },

    run: async (bot, message, args) => {

        // Grab the channel, role and settings
        const channel = await getChannel(message, args.join(" "), true),
        role = await getRole(message, args.join(" ")) || await getRole(message, args.join(" ").replace("+", ""));
        
        if (!args[0]) {
            // If there is nothing ignored, then return an error
            if (!message.settings.ignore.hierarchicRoleId && message.settings.ignore.roles.length <= 0 && message.settings.ignore.channels.length <= 0)
                return message.errorReply(`Nothing other than users with the \`ADMINISTRATOR\` permission are being ignored.`);
            
            // Grab the hierarchicRole & define role/channel arrays
            const hRole = message.guild.roles.cache.get(message.settings.ignore.hierarchicRoleId),
            roles = [],
            channels = [];
            
            // Define base message content
            let msg = "**Ignore Settings:**";

            // Loop through the roles and add them to the array
            if (message.settings.ignore.roles) {
                for (const data of message.settings.ignore.roles) {
                    const role = message.guild.roles.cache.get(data);
                    if (role) roles.push(role);
                }
            }
            
            // Loop through the channels and add them to the array
            if (message.settings.ignore.channels) {
                for (const data of message.settings.ignore.channels) {
                    const channel = message.guild.channels.cache.get(data);
                    if (channel) channels.push(channel);
                }
            }
            
            // Prepare the ignore message
            if (message.settings.ignore.hierarchicRoleId && hRole) msg += `\n🎖️ Users with the ${hRole} and above are currently being ignored`;
            if (roles.length > 0) msg += `\n${config.emojis.team} The following roles are being ignored: ${roles.join(', ')}`;
            if (channels.length > 0) msg += `\n${config.emojis.channel} The following channels are being ignored: ${channels.join(', ')}`;
            
            // Send the ignore message
            message.reply(msg);
        } else if (role && args.join(" ").toLowerCase().includes("+") && (role.name.match(/\+/g) || []).length < (args.join("").match(/\+/g) || []).length) {
            // Get the DB query
            const toUpdate = { "ignore.hierarchicRoleId": message.settings.ignore.hierarchicRoleId == role.id ? null : role.id };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(message.settings.ignore.hierarchicRoleId == role.id ? `The bot will no longer ignore ${role} and up!` : `Added ${role} and up to the ignore list!`);
        } else if (role) {
            // Get the DB query
            const toUpdate = message.settings.ignore.roles.includes(role.id)
                ? { $pull: { "ignore.roles": role.id } }
                : { $push: { "ignore.roles": role.id } };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`Successfully ${message.settings.ignore.roles.includes(role.id) ? `removed ${role} from` : `added ${role} to`} the list of ignored roles!`);
        } else if (channel) {
            // If the user didn't specify a text channel return an error
            if (channel.type !== "GUILD_TEXT" && channel.type !== "GUILD_NEWS") 
                return message.errorReply("You did not specify a text or news channel!");

            // Get the DB query
            const toUpdate = message.settings.ignore.channels.includes(channel.id)
                ? { $pull: { "ignore.channels": channel.id } }
                : { $push: { "ignore.channels": channel.id } };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: message.guild.id }, toUpdate);

            // Send a confirmation message
            message.confirmationReply(`Successfully ${message.settings.ignore.channels?.includes(channel.id) ? `removed ${channel} from` : `added ${channel} to`} the list of ignored channels!`);
        }

    },

    run_interaction: async (bot, interaction) => {

        // Get the options
        const view = interaction.options.get("view"),
        role = interaction.options.get("role"),
        channel = interaction.options.get("channel");

        if (view) {
            // If there is nothing ignored, then return an error
            if (!interaction.settings.ignore.hierarchicRoleId && interaction.settings.ignore.roles.length <= 0 && interaction.settings.ignore.channels.length <= 0)
                return interaction.error(`Nothing other than users with the \`ADMINISTRATOR\` permission are being ignored.`);
            
            // Grab the hierarchicRole & define role/channel arrays
            const hRole = interaction.guild.roles.cache.get(interaction.settings.ignore.hierarchicRoleId),
            roles = [],
            channels = [];
            
            // Define base message content
            let msg = "**Ignore Settings:**";

            // Loop through the roles and add them to the array
            if (interaction.settings.ignore.roles) {
                for (const data of interaction.settings.ignore.roles) {
                    const role = interaction.guild.roles.cache.get(data);
                    if (role) roles.push(role);
                }
            }
            
            // Loop through the channels and add them to the array
            if (interaction.settings.ignore.channels) {
                for (const data of interaction.settings.ignore.channels) {
                    const channel = interaction.guild.channels.cache.get(data);
                    if (channel) channels.push(channel);
                }
            }
            
            // Prepare the ignore message
            if (interaction.settings.ignore.hierarchicRoleId && hRole) msg += `\n🎖️ Users with the ${hRole} and above are currently being ignored`;
            if (roles.length > 0) msg += `\n${config.emojis.team} The following roles are being ignored: ${roles.join(', ')}`;
            if (channels.length > 0) msg += `\n${config.emojis.channel} The following channels are being ignored: ${channels.join(', ')}`;
            
            // Send the ignore message
            interaction.reply(msg);
        } else if (role) {
            // Get the role
            const rl = role.options.get("role").role;

            // Get the DB query
            const toUpdate = role.options.get("hierarchic")?.value
                ? interaction.settings.ignore.hierarchicRoleId == rl.id
                    ? { "ignore.hierarchicRoleId": null }
                    : { "ignore.hierarchicRoleId": rl.id }
                : interaction.settings.ignore.roles.includes(rl.id)
                    ? { $pull: { "ignore.roles": rl.id } }
                    : { $push: { "ignore.roles": rl.id } };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send a confirmation message
            if (role.options.get("hierarchic")?.value) {
                interaction.confirmation(interaction.settings.ignore.hierarchicRoleId == rl.id ? `The bot will no longer ignore ${rl} and up!` : `Added ${rl} and up to the ignore list!`);
            } else {
                interaction.confirmation(`Successfully ${interaction.settings.ignore.roles.includes(rl.id) ? `removed ${rl} from` : `added ${rl} to`} the list of ignored roles!`);
            }
        } else if (channel) {
            const chan = channel.options.get("channel").channel;

            // If the user didn't specify a text channel return an error
            if (chan.type !== "text" && chan.type !== "news") 
                return interaction.error("You did not specify a text or news channel!");

            // Get the DB query
            const toUpdate = interaction.settings.ignore.channels.includes(chan.id)
                ? { $pull: { "ignore.channels": chan.id } }
                : { $push: { "ignore.channels": chan.id } };

            // Update the setting in the DB
            await settings.findOneAndUpdate({ _id: interaction.guild.id }, toUpdate);

            // Send a confirmation message
            interaction.confirmation(`Successfully ${interaction.settings.ignore.channels?.includes(chan.id) ? `removed ${chan} from` : `added ${chan} to`} the list of ignored channels!`);
        }

    }
};