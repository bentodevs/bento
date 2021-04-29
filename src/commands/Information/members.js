const { MessageEmbed } = require("discord.js");
const { getRole } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "members",
        aliases: [
            "listmembers"
        ],
        usage: "members [role] [page]",
        examples: [
            "members staff",
            "members staff 2",
            "members 2"
        ],
        description: "List all server members or all members with a specific role.",
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
        guildOnly: true,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async function (bot, message, args) {

        // Get the specified role (if any)
        let role = await getRole(message, !isNaN(args[args.length - 1]) && !/^[0-9]{16,}$/.test(args[args.length - 1]) ? args.slice(0, args.length -1).join(" ") : args.join(" "));

        // If args[0] is a number set role to undefined
        if (!isNaN(args[0]) && role?.id !== args[0]) 
            role = undefined;

        // If the user specified a invalid role return an error
        if (!role && args[0])
            return message.error("You didn't specify a valid role!");

        if (!role) {
            // Pages variables
            const pages = [];
            let page = 0;

            // Sort members by role position
            const members = message.guild.members.cache.sort((a,b) => b.roles.highest.position - a.roles.highest.position).array();

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < members.length; i += 20) {
                pages.push(members.slice(i,i+20));
            }

            // If args[0] is a number set it as the page
            if (!isNaN(args[0])) 
                page = args[0] -= 1;
            // Return if the page wasn't found
            if (!pages[page]) 
                return message.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `\`${m.user.tag}\` | **ID:** ${m.id}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor(`Members of ${message.guild.name}`, message.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${message.guild.memberCount} total members | Page ${page + 1} of ${pages.length}`)
                .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
                .setDescription(description);
            
            // Send the members embed
            message.channel.send(embed);
        } else if (role) {
            // Pages variables
            const pages = [];
            let page = 0;

            // Return an error if the role doesn't have any members
            if (!role.members.size)
                return message.error("The role you specified doesn't have any members!");

            // Format and map the members
            const members = role.members.array();

            // Loop through the members and devide them into pages of 20
            for (let i = 0; i < members.length; i += 20) {
                pages.push(members.slice(i, i+20));
            }

            // Check if a page was specified and set it as that page
            if (!isNaN(args[args.length - 1]) && !/^[0-9]{16,}$/.test(args[args.length - 1])) 
                page = args[args.length - 1] -= 1;

            // If the page specified doesn't exists return
            if (!pages[page])
                return message.error("You didn't specify a valid page!");

            // Format the description
            const description = pages[page].map(m => `\`${m.user.tag}\` | **ID:** ${m.id}`);

            // Create the members embed
            const embed = new MessageEmbed()
                .setAuthor(`Members of ${role.name}`, message.guild.iconURL({format: "png", dynamic: true}))
                .setFooter(`${role.members.size} total members | Page ${page + 1} of ${pages.length}`)
                .setColor(role.hexColor ?? bot.config.general.embedColor)
                .setDescription(description);
            
            // Send the members embed
            message.channel.send(embed);
        }

    }
};