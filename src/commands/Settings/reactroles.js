const reactroles = require("../../database/models/reactroles");
const { getRole, getEmoji } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "reactroles",
        aliases: [
            "rr",
            "rroles"
        ],
        usage: "reactroles [\"add\" | \"remove\"] <channel> <message id> [emoji] [role]",
        examples: ["reactroles add #roles 781317986525904916 📘 Blue"],
        description: "Add or remove react roles to/from messages.",
        category: "Settings",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_ROLES",
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
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        const option = args[0]?.toLowerCase();

        if (!option) {
            // Grab all the react role data for this guild
            const reactRoles = await reactroles.find({guild: message.guild.id});

            // If no data was found return an error
            if (!reactRoles.length)
                return message.errorReply("There aren't any reaction menus setup for this guild!");

            // Define the msg and num
            let msg = "__**Reaction Roles**__\n\n",
            num = 0;

            // Loop through the react roles data
            for (const data of reactRoles) {
                // Increase the number by 1
                num ++;

                // Grab the channel, message and the roles
                const reactChannel = message.guild.channels.cache.get(data.channel),
                reactMsg = await reactChannel.messages.fetch(data.message).catch(() => {}),
                roles = data.roles;

                // If the message wasn't found return an error
                if (!reactMsg)
                    return;

                // Add the data to the message
                msg += `**${num}.** Message ID: ${reactMsg.id} | ${roles.length} roles | ${reactChannel}\n`;
            }

            // If the message is empty return an error
            if (!msg)
                return message.errorReply("There aren't any reaction menus setup for this guild!");

            // Send the message
            message.reply(msg);
        } else if (option === "add") {
            // Grab the channel
            const channel = message.mentions.channels?.first();

            // If the user didn't specify a channel return an error
            if (!channel)
                return message.errorReply("You didn't specify a valid channel! *(You must mention a channel!)*");
            // If the user didn't specify a message id return an error
            if (!args[2])
                return message.errorReply("You didn't specify a message id!");
            // If the user didn't specify a emoji return an error
            if (!args[3])
                return message.errorReply("You didn't specify a emoji!");
            // If the user didn't specify a role return an error
            if (!args[4])
                return message.errorReply("You didn't specify a role!");

            // Grab the message, emote and role
            const msg = await channel.messages.fetch(args[2]).catch(() => {}),
            emote = getEmoji(message.guild, args[3]),
            role = await getRole(message, args.slice(4).join(" "));

            // If the user didn't specify a valid message return an error
            if (!msg)
                return message.errorReply("You didn't specify a valid message ID!");
            // If no emote was found return an error
            if (!emote)
                return message.errorReply("You didn't specify a valid emoji! *You must specify a emoji from this Discord or a default Discord emoji.*");
            // If the user didn't specify a valid role return an error
            if (!role)
                return message.errorReply("You didn't specify a valid role!");

            // Grab the reactRole data
            const data = await reactroles.findOne({ guild: message.guild.id, message: msg.id });

            if (data) {
                // If the role is already in the array return an error
                if (data.roles.find(r => r.role === role.id))
                    return message.errorReply("The role you specified is already added to this message!");
                // If the emoji is already in the array return an error
                if (data.roles.find(r => r.emoji === emote.id ? emote.id : emote.emoji))
                    return message.errorReply("The emoji you specified is already added to this message!");

                // React to the message
                msg.react(emote.id ? emote.id : emote.emoji);
                // Push the role and emoji to the enmap
                await reactroles.findOneAndUpdate({ guild: message.guild.id, message: msg.id }, {
                    $push: {
                        roles: {
                            role: role.id,
                            emoji: emote.id ? emote.id : emote.emoji
                        }
                    }
                });
                // Send a confirmation message
                message.confirmationReply("Successfully added the react role to that message!");
            } else {
                // React to the message
                msg.react(emote.id ? emote.id : emote.emoji);

                // Set the enmap data
                await reactroles.create({
                    guild: message.guild.id,
                    message: msg.id,
                    channel: channel.id,
                    roles: [{ role: role.id, emoji: emote.id ? emote.id : emote.emoji }]
                });

                // Send a confirmation message
                message.confirmationReply("Successfully added the react role to that message!");
            }
        } else if (option === "remove") {
            // If the user didn't specify a message ID return an error
            if (!args[1])
                return message.errorReply("You need to specify a message ID to remove!");

            // Grab the react menu
            const reactMenu = await reactroles.findOne({ guild: message.guild.id, message: args[1] });

            // If no menu was found return an error
            if (!reactMenu)
                return message.errorReply("You didn't specify a message ID which is being used for a react message!");

            // Delete the menu
            await reactroles.findOneAndDelete({ guild: message.guild.id, message: args[1] });

            // Send a confirmation
            message.confirmationReply("Successfully removed that react message from the database!");
        } else {
            // Return an error
            message.errorReply("You didn't specify a valid option!");
        }

    }
};