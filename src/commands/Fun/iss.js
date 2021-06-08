const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { default: fetch } = require("node-fetch");

module.exports = {
    info: {
        name: "iss",
        aliases: ["spacestation"],
        usage: "",
        examples: [],
        description: "Get information about the International Space Station",
        category: "Fun",
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
        opts: []
    },

    run: async (bot, message) => {

        const iss = await (await fetch("http://api.open-notify.org/iss-now.json")).json(),
        issPeople = await (await fetch("http://api.open-notify.org/astros.json")).json();
        
        const humans = issPeople.people.reduce((a, b) => {
            a[b.craft] = a[b.craft] || [];
            a[b.craft].push(b.name);
            return a;
        }, {});

        const embed = new MessageEmbed()
            .setAuthor('ISS Info', 'https://cdn.freelogovectors.net/wp-content/uploads/2016/12/nasa-logo.png')
            .setColor(message.member?.displayColor ?? bot.config.general.embedColor)
            .setThumbnail("https://cdn.freelogovectors.net/wp-content/uploads/2016/12/nasa-logo.png")
            .setDescription(stripIndents`**Current Location:** ${iss.iss_position.latitude}, ${iss.iss_position.longitude},
            **Current Astronauts:** ${issPeople.number}`)
            .setFooter("Last updated")
            .setTimestamp();
        
        for (const [craft, ppl] of Object.entries(humans)) {
            for (let i = 0; i < ppl.length; i++) {
                ppl[i] = `${i + 1}. ${ppl[i]}`;
            }
            embed.addField(`${craft}`, ppl.join('\n'));
        }

        message.reply(embed);

    }
};