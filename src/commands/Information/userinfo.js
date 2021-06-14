const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { format, formatDistance } = require("date-fns");
const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "userinfo",
        aliases: [
            "whois",
            "uinfo"
        ],
        usage: "userinfo [user]",
        examples: [
            "userinfo Jarno",
            "userinfo Waitrose"
        ],
        description: "Displays information about a guild member or Discord user.",
        category: "Information",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "Specify a user.",
            required: false
        }]
    },

    run: async function (bot, message, args) {

        // Grab the member or user
        const member = message.options?.get("user")?.member || await getMember(message, args?.join(" "), true) || await getUser(bot, message, args?.join(" "), true);

        // Return an error if nothing was found
        if (!member) 
            return message.error("You didn't specify a valid user!");

        // Create the MessageEmbed object.
        const embed = new MessageEmbed();

        // Check if the user is a guild member
        if (member.guild) {
            // 1. Get the users account creation time and format it
            // 2. Get the time the user joined the guild and format it
            // 3. Get the time the user started boosting and format it
            // 4. Get the roles the user has and format them
            const userCreated = format(member.user.createdTimestamp, "PPp"); const timeSinceCreated = formatDistance(member.user.createdTimestamp, Date.now(), { addSuffix: true });
            const userJoined = format(member.joinedTimestamp, "PPp"); const timeSinceJoin = formatDistance(member.joinedTimestamp, Date.now(), { addSuffix: true });
            const userBoosted = member.premiumSinceTimestamp ? format(member.premiumSinceTimestamp, "PPp") : null; const timeSinceBoost = member.premiumSinceTimestamp ? formatDistance(member.premiumSinceTimestamp, Date.now(), { addSuffix: true }) : null;
            const roles = member.roles.cache.filter(role => role.name !== "@everyone").sort((b, a) => a.position - b.position).map(role => role.toString()).join(", ");

            // Define vars
            let statusEmote;
            let statusText;

            // Switch between statusses and set the variables accordingly
            switch (member.presence.status) {
                case "online":
                    statusEmote = bot.config.emojis.online;
                    statusText = "**Online**";
                    break;
                case "idle":
                    statusEmote = bot.config.emojis.idle;
                    statusText = "**Idle**";
                    break;
                case "offline":
                    statusEmote = bot.config.emojis.offline;
                    statusText = "**Offline**";
                    break;
                case "dnd":
                    statusEmote = bot.config.emojis.dnd;
                    statusText = "**Do Not Disturb**";
                    break;
            }

            // Define the description
            let description = `**Created:** ${userCreated} (${timeSinceCreated})
            **Joined:** ${userJoined} (${timeSinceJoin})`;

            // If the user is a booster add it to the description
            if (member.premiumSinceTimestamp) description += `\n**Boosting:** ${userBoosted} (${timeSinceBoost})`;
            // If the user has roles add them to the description
            if (member.roles.cache.size > 1) description += `\n\n**Roles (${member.roles.cache.size -1}):** ${roles}`;
            // Check if the user has any activities
            if (member.presence.activities.length >= 1) {
                // Add the presence header to the description
                description += `\n\n**Presence**`;

                // Loop through the users activities and add them to the description
                member.presence.activities.forEach(a => {
                    if (a.type === "LISTENING") description += `\n${bot.config.emojis.spotify} Listening to: **${a.details}** by **${a.state}**`;
                    if (a.type === "PLAYING") description += `\n${bot.config.emojis.game} Playing: **${a.name}**${a.timestamps ? a.timestamps.start ? ` for **${formatDistance(a.timestamps.start, Date.now())}**` : ` (${formatDistance(Date.now(), a.timestamps.end)} left)` : ""}`;
                    if (a.type === "CUSTOM_STATUS" && a.state) description += `\n${bot.config.emojis.discord} Custom Status: **${a.state}**`;
                    if (a.type === "STREAMING") description += `\n${bot.config.emojis.twitch} Streaming: [${a.state}](${a.url})`;
                    if (a.type === "WATCHING") description += `\n${bot.config.emojis.player} Watching: **${a.name}**`;
                    if (a.type === "COMPETING") description += `\n${bot.config.emojis.trophy} Competing in: **${a.name}**`;
                });

                // Add the users status to the description
                description += `\n${statusEmote} Status: **${statusText}**`;
            } else {
                // Add the users status to the description
                description += `\n\n${statusEmote} ${statusText}`;
            }

            // Prepare the embed
            embed.setAuthor(`${member.user.tag}${member.nickname ? ` ~ ${member.nickname}` : ""}`, member.user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }));
            embed.setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }));
            embed.setDescription(stripIndents(description));
            embed.setColor(member.displayColor ?? bot.config.embedColor);
            embed.setFooter(`Member #${message.guild.members.cache.filter(u => u.joinedTimestamp !== null).sort((a,b) => a.joinedTimestamp - b.joinedTimestamp).map(user => user.id).indexOf(member.id) +1} | ID: ${member.id}`);
        } else {
            // Get the users account creation time and format it
            const userCreated = format(member.createdTimestamp, "PPp"); const timeSinceCreated = formatDistance(member.createdTimestamp, Date.now(), { addSuffix: true });

            // Define status var
            let status;

            // Switch between statusses and set the variables accordingly
            switch (member.presence.status) {
                case "online":
                    status = "<:online:774282494593466388> **Online**";
                    break;
                case "idle":
                    status = "<:idle:774282494458593310> **Idle**";
                    break;
                case "offline":
                    status = "<:offline:774282494223712298> **Offline**";
                    break;
                case "dnd":
                    status = "<:dnd:774282494090412073> **Do Not Disturb**";
                    break;
            }

            // Prepare the embed
            embed.setAuthor(member.tag, member.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }));
            embed.setThumbnail(member.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }));
            embed.setColor("#ABCDEF");
            embed.setDescription(stripIndents`🙍 Human | ${status}
            **Created:** ${userCreated} (${timeSinceCreated})
            
            *This user is not a member of the server. No additional info is available.*`);
            embed.setFooter(`ID: ${member.id}`);
        }

        // Send the embed
        message.reply({ embeds: [embed] });

    },
};