const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { default: fetch } = require('node-fetch');

module.exports = {
    info: {
        name: 'iss',
        aliases: ['spacestation'],
        usage: '',
        examples: [],
        description: 'Get information about the International Space Station',
        category: 'Fun',
        info: null,
        options: [],
    },
    perms: {
        permission: ['@everyone'],
        type: 'role',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [],
    },

    run: async (bot, message) => {
        // Fetches the ISS location data from the API
        const iss = await (await fetch('http://api.open-notify.org/iss-now.json')).json();
        // Fetches the ISS personnel data from the API
        const issPeople = await (await fetch('http://api.open-notify.org/astros.json')).json();

        // Sort the people in the ISS by vehicle
        const humans = issPeople.people.reduce((a, b) => {
            // eslint-disable-next-line no-param-reassign
            a[b.craft] = a[b.craft] || [];
            a[b.craft].push(b.name);
            return a;
        }, {});

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor('ISS Info', 'https://cdn.freelogovectors.net/wp-content/uploads/2016/12/nasa-logo.png')
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .setThumbnail('https://cdn.freelogovectors.net/wp-content/uploads/2016/12/nasa-logo.png')
            .setDescription(stripIndents`**Current Location:** \`${iss.iss_position.latitude}\`, \`${iss.iss_position.longitude}\`
            **Current Astronauts:** \`${issPeople.number}\``)
            .setFooter('Last updated')
            .setTimestamp();

        // Add the humans to the embed
        for (const [craft, ppl] of Object.entries(humans)) {
            // For each person in the craft, add the number and name
            for (let i = 0; i < ppl.length; i += 1) {
                ppl[i] = `${i + 1}. ${ppl[i]}`;
            }
            // Add the field to the embed
            embed.addField(`${craft}`, ppl.join('\n'), true);
        }

        // Send the embed
        message.reply({ embeds: [embed] });
    },
};
