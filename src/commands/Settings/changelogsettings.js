const settings = require("../../database/models/settings");
const { getChannel } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "changelogsettings",
        aliases: ["clogsettings"],
        usage: "changelogsettings <\"channel\" | \"location\"> [option]",
        examples: [
            "changelogsettings channel #updates",
            "changelogsettings location skyblock"
        ],
        description: "Configure the changelog settings",
        category: "Settings",
        info: null,
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
        noArgsHelp: true,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        if (args[0].toLowerCase() == "channel") {
            if (!args[1]) {
                if (!message.settings.changelogs.channel)
                    return message.errorReply("There is no Changelog channel configured!");

                if (!message.guild.channels.cache.has(message.settings.changelogs.channel)) {
                    await settings.findOneAndUpdate({ _id: message.guild.id }, { "changelogs.channel": null });
                    return message.errorReply("The Changelog channel was unset as the channel no longer exists!");
                }

                return message.confirmationReply(`The Changelog channel is currently set to ${message.guild.channels.cache.get(message.settings.changelogs.channel)}`);
            } else {
                const channel = await getChannel(message, args.slice(0).join(" "));

                if (!channel || channel.type !== "GUILD_TEXT" && channel.type !== "GUILD_NEWS")
                    return message.errorReply("You did not specify a valid channel! *The channel must exist, and be a Text or Announcement channel!*");

                await settings.findOneAndUpdate({ _id: message.guild.id }, { "changelogs.channel": channel.id });
                return message.confirmationReply(`The Changelog channel has been set to ${channel}`);
            }
        } else if (args[0].toLowerCase() == "location") {
            if (!args[1]) {
                if (!message.settings.changelogs.locations?.length)
                    return message.errorReply("There are no Changelog locations configured!");

                const locations = message.settings.changelogs.locations.join("`, `");

                return message.confirmationReply(`There are currently \`${message.settings.changelogs.locations?.length}\` Changelog locations configured: \`${locations}\``);
            } else {
                const location = args[1].toLowerCase();

                if (message.settings.changelogs.locations?.includes(location)) {
                    await settings.findOneAndUpdate({ _id: message.guild.id }, {
                        $pull: {
                            "changelogs.locations": location
                        }
                    });

                    message.confirmationReply(`Successfully removed ${location} from the list of Changelog locations!`);
                } else {
                    await settings.findOneAndUpdate({ _id: message.guild.id }, {
                        $push: {
                            "changelogs.locations": location
                        }
                    });

                    message.confirmationReply(`Successfully added ${location} to the list of Changelog locations!`);
                }
            }
        } else {
            return message.errorReply("You must specify either `channel` or `location`!");
        }

    }
};