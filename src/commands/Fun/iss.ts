import { stripIndents } from 'common-tags';
import {
    EmbedBuilder, EmbedField, GuildMember, PermissionFlagsBits,
} from 'discord.js';
import { request } from 'undici';
import { Command } from '../../modules/interfaces/cmd';
import { DEFAULT_COLOR } from '../../data/constants';

const command: Command = {
    info: {
        name: 'iss',
        usage: '',
        examples: [],
        description: 'Get information about the International Space Station',
        category: 'Fun',
        selfPerms: [
            PermissionFlagsBits.EmbedLinks,
        ],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            user: false,
            message: false,
        },
        opts: [],
        dmPermission: true,
        defaultPermission: true,
    },

    run: async (bot, interaction) => {
        // Fetches the ISS location data from the API
        const iss: IssNow = await request('http://api.open-notify.org/iss-now.json').then((res) => res.body.json());
        // Fetches the ISS personnel data from the API
        const issPeople: Astros = await request('http://api.open-notify.org/astros.json').then((res) => res.body.json());

        // Sort the people in the ISS by vehicle
        const humans: AstronautsByCraft = issPeople.people.reduce((a, b) => {
            // eslint-disable-next-line no-param-reassign
            a[b.craft] = a[b.craft] || [];
            a[b.craft].push(b.name);
            return a;
        }, {});

        // Build the embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'ISS Info', iconURL: 'https://bento-bot.com/bot-assets/ISS_emblem.png' })
            .setColor((interaction.member as GuildMember)?.displayHexColor || DEFAULT_COLOR)
            .setThumbnail('https://bento-bot.com/bot-assets/ISS_emblem.png')
            .setDescription(stripIndents`**Current Location:** \`${iss.iss_position.latitude}\`, \`${iss.iss_position.longitude}\`
            **Current Astronauts:** \`${issPeople.number}\``)
            .setFooter({ text: 'Last updated' })
            .setTimestamp();

        const fields: EmbedField[] = [];

        // Add the humans to the embed
        for (const [craft, ppl] of Object.entries(humans)) {
            // For each person in the craft, add the number and name
            for (let i = 0; i < (ppl as unknown as Astro[]).length; i += 1) {
                (ppl as unknown as Astro)[i] = `${i + 1}. ${(ppl as unknown as Astro)[i]}`;
            }

            fields.push({
                name: craft,
                value: (ppl as string[]).join('\n'),
                inline: true,
            });
        }

        embed.addFields(fields);

        // Send the embed
        interaction.reply({ embeds: [embed] });
    },
};

type IssNow = { message: string, timestamp: number, iss_position: { longitude: string, latitude: string } };
type Astros = { number: number, people: Array<Astro>, message: string };
type Astro = { name: string, craft: string };
type AstronautsByCraft = {
    [key: string]: string[]
}

export default command;
