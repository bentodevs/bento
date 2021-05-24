const { getChannel, getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "ignore",
        aliases: [],
        usage: "ignore [channel | role]",
        examples: ["ignore #commands", "ignore moderator", "ignore moderator+"],
        description: "Manage what roles or channels are ignored by automatic moderation features",
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

    run: async (bot, message, args) => {

        // Grab the channel, role and settings
        const channel = await getChannel(message, args.join(" "), true),
            role = await getRole(message, args.join(" ")) || await getRole(message, args.join(" ").replace("+", ""));
        
        if (!args[0]) {
            // If there is nothing ignored, then return an error
            if (!message.settings.ignore.hierarchicRoleId && message.settings.ignore.roles.length <= 0 && message.settings.ignore.channels.length <= 0)
                return message.error(`Nothing other than users with the \`ADMINISTRATOR\` permission are being ignored.`);
            
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
            if (roles.length > 0) msg += `\n<:team:843408255233687572> The following roles are being ignored: ${roles.join(', ')}`;
            if (channels.length > 0) msg += `\n<:channel:843408284010545153> The following channels are being ignored: ${channels.join(', ')}`;
            
            // Send the ignore message
            message.channel.send(msg);
        } else if (role && args.join(" ").toLowerCase().includes("+") && (role.name.match(/\+/g) || []).length() < (args.join("").match(/\+/g) || []).length) {
            // Code
        } else if (role) {
            // Code
        } else if (channel) {
            // Code
        }

    }
};