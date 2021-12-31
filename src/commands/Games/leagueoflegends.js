import { stripIndents } from 'common-tags';
import dateFnsTz from 'date-fns-tz';
import { format } from 'date-fns';
import { MessageEmbed } from 'discord.js';
import { getLeagueSummoner, getLeagueChampByID } from '../../modules/functions/riotgames.js';

const { utcToZonedTime } = dateFnsTz;

export default {
    info: {
        name: 'leagueoflegends',
        aliases: ['lol'],
        usage: 'leagueoflegends <region> <summoner>',
        examples: ['leagueoflegends na WaitroseNA'],
        description: 'Get information about a League of Legends summoner',
        category: 'Games',
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
        noArgsHelp: true,
        disabled: true,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'region',
            type: 'STRING',
            description: 'Select the region your League of Legends account is registered in.',
            required: true,
            choices: [
                { name: 'Brazil', value: 'BR' },
                { name: 'Europe Nordic & East', value: 'EUN' },
                { name: 'Europe West', value: 'EUW' },
                { name: 'Latin America North', value: 'LAN' },
                { name: 'Latin America South', value: 'LAS' },
                { name: 'North America', value: 'NA' },
                { name: 'Oceania', value: 'OC' },
                { name: 'Russia', value: 'RU' },
                { name: 'Turkey', value: 'TR' },
                { name: 'Japan', value: 'JP' },
                { name: 'Republic of Korea', value: 'KR' },
            ],
        }, {
            name: 'summoner',
            type: 'STRING',
            description: 'Your League of Legends summoner name.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        // If no summoner was provided, then throw an error
        if (!args[1]) return message.errorReply("You didn't provide any summoner name!");

        // Send a loading message & assign it to msg
        const msg = await message.loadingReply(`Fetching the League of Legends profile for \`${args.slice(1).join('')}\``);

        // Fetch the league summoner data
        const data = await getLeagueSummoner(args[0], args.slice(1).join(''));

        // Catch any errors
        if (data === 'NO_REGION') return msg.edit(`${bot.config.emojis.error} It looks like you entered an incorrect region!`);

        if (data === 'NO_USER_FOUND') return msg.edit(`${bot.config.emojis.error} It looks like there isn't a Summoner with that name!`);

        // Sort the matches by time
        const matchList = data.matchData.matches.sort((a, b) => b.timestamp - a.timestamp);

        // Set the recent matches string
        let matches = '**Recent Matches**\n';

        // For the 5 most recent matches in a player's history, fetch the data and add
        // to the recent matches string
        for await (const m of matchList.slice(0, 5)) {
            const champ = await getLeagueChampByID(m.champion);

            matches += `**Played:** ${format(utcToZonedTime(m.timestamp, message.settings.general.timezone), 'Pp (z)', { timeZone: message.settings.general.timezone })} | **Lane:** ${m.lane.toTitleCase()} | **Champ:** ${champ.name}\n`;
        }

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`League of Legends data for ${data.user}`, `https://ddragon.leagueoflegends.com/cdn/11.9.1/img/profileicon/${data.profileIconId}.png`)
            .setColor(message.member?.displayColor || bot.config.general.embedColor)
            .setDescription(stripIndents`**Summoner Name:** ${data.user}
            **Summoner Level:** ${data.summonerLevel}
            **Games Played:** ${data.matchData.totalGames}

            ${matches}`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true, format: 'png' }) });

        // Delete the loading message
        msg.delete().catch(() => { });
        // Send the embed
        message.reply({ embeds: [embed] });
    },

    run_interaction: async (bot, interaction) => {
        // Defer the interaction
        await interaction.deferReply();

        // Fetch the league summoner data
        const data = await getLeagueSummoner(interaction.options.get('region').value, interaction.options.get('summoner').value);

        // Catch any errors
        if (data === 'NO_REGION') return interaction.editReply(`${bot.config.emojis.error} It looks like you entered an incorrect region!`);

        if (data === 'NO_USER_FOUND') return interaction.editReply(`${bot.config.emojis.error} It looks like there isn't a Summoner with that name!`);

        // Sort the matches by time
        const matchList = data.matchData.matches.sort((a, b) => b.timestamp - a.timestamp);

        // Set the recent matches string
        let matches = '**Recent Matches**\n';

        // For the 5 most recent matches in a player's history, fetch the data and add
        // to the recent matches string
        for await (const m of matchList.slice(0, 5)) {
            const champ = await getLeagueChampByID(m.champion);

            matches += `**Played:** ${format(m.timestamp, 'Pp')} | **Lane:** ${m.lane.toTitleCase()} | **Champ:** ${champ.name}\n`;
        }

        // Build the embed
        const embed = new MessageEmbed()
            .setAuthor(`League of Legends data for ${data.user}`, `https://ddragon.leagueoflegends.com/cdn/11.9.1/img/profileicon/${data.profileIconId}.png`)
            .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
            .setDescription(stripIndents`**Summoner Name:** ${data.user}
            **Summoner Level:** ${data.summonerLevel}
            **Games Played:** ${data.matchData.totalGames}

            ${matches}`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, format: 'png' }) });

        // Send the embed
        interaction.editReply({ embeds: [embed] });
    },
};
