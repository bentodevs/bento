import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import {
    getGlobalStats, getVaccineData, getAllCountryData, getDataByState, getDataByContinent, getDataByCountry,
} from '../../modules/functions/corona.js';

export default {
    info: {
        name: 'corona',
        aliases: [
            'rona',
            'covid',
            'covid19',
        ],
        usage: 'corona [option] [value]',
        examples: [
            'corona netherlands',
            'corona top',
            'corona top deaths',
            'corona state new york',
            'corona continent europe',
        ],
        description: 'View statistics about the COVID-19 virus.',
        category: 'Miscellaneous',
        info: null,
        options: [
            '`corona <country>` - Gets the covid stats for the specified country.',
            '`corona top ["cases" | "deaths"]` - Top 10 countries with the most deaths/cases.',
            '`corona state <state>` - Gets the covid stats for the specified state.',
            '`corona continent <continent>` - Gets the covid stats for the specified continent.',
        ],
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
        opts: [{
            name: 'global',
            type: 'SUB_COMMAND',
            description: 'View global COVID-19 stats.',
        }, {
            name: 'top',
            type: 'SUB_COMMAND',
            description: 'View the countries with the most cases or deaths.',
            options: [{
                name: 'option',
                type: 'STRING',
                description: 'Select cases or deaths.',
                choices: [
                    { name: 'Cases', value: 'cases' },
                    { name: 'Deaths', value: 'deaths' },
                ],
                required: true,
            }],
        }, {
            name: 'state',
            type: 'SUB_COMMAND',
            description: 'View the COVID-19 stats of a US state.',
            options: [{
                name: 'state',
                type: 'STRING',
                description: 'The name of a US state.',
                required: true,
            }],
        }, {
            name: 'continent',
            type: 'SUB_COMMAND',
            description: 'View the COVID-19 stats of a continent.',
            options: [{
                name: 'continent',
                type: 'STRING',
                description: 'The name of a continent.',
                required: true,
            }],
        }, {
            name: 'country',
            type: 'SUB_COMMAND',
            description: 'View the COVID-19 stats of a country.',
            options: [{
                name: 'country',
                type: 'STRING',
                description: 'The name of a country.',
                required: true,
            }],
        }],
    },

    run: async (bot, message, args) => {
        const option = args?.[0]?.toLowerCase();

        if (!option) {
            // Send a status message
            const msg = await message.loadingReply('Fetching data...');

            // Get the stats and vaccine data
            const stats = await getGlobalStats();
            const vaccines = await getVaccineData(1, true);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle('Global COVID-19 Statistics')
                .setThumbnail('https://i.imgur.com/2K1x0bS.png')
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setFooter({ text: 'Updated', iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setTimestamp(stats.updated)
                .addField('Overall Statistics', stripIndents`Cases: **${stats.cases.toLocaleString()}**
                    Deaths: **${stats.deaths.toLocaleString()}**
                    Recovered: **${stats.recovered.toLocaleString()}**
                    Tests: **${stats.tests.toLocaleString()}**
                    Vaccinations: **${vaccines[0].total.toLocaleString()}**`, true)
                .addField('Today', stripIndents`Cases: **${stats.todayCases.toLocaleString()}**
                    Deaths: **${stats.todayDeaths.toLocaleString()}**
                    Recovered: **${stats.todayRecovered.toLocaleString()}**`, true)
                .addField('Other Stats', stripIndents`Countries Affected: **${stats.affectedCountries}**
                    Population: **${stats.population.toLocaleString()}**
                    Active Cases: **${stats.active.toLocaleString()}**
                    Critical Cases: **${stats.critical.toLocaleString()}**`, false);

            // Delete the status message & send the embed
            msg.delete().catch(() => { });
            message.reply({ embeds: [embed] });
        } else if (option === 'top' && (['cases', 'deaths'].includes(args[1]?.toLowerCase()) || !args[1])) {
            // Send a status message
            const msg = await message.loadingReply('Fetching data...');

            // Check if the user specified an argument
            if (args[1] && !['cases', 'deaths'].includes(args[1].toLowerCase())) msg.edit(`${bot.config.emojis.error} You didn't specify a valid option!`);

            // Get the sort option
            let opt;

            if (args[1] && ['cases', 'deaths'].includes(args[1].toLowerCase())) opt = args[1].toLowerCase();
            else opt = 'cases';

            // Get the stats, reduce them to just the top 10 and format them
            const stats = await getAllCountryData(opt);
            const top = stats.splice(0, 10);
            const description = top.map((a, index) => `**${index + 1}.** ${a.country} | \`${a.cases.toLocaleString()}\` ${opt}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`Countries with the most COVID-19 ${opt}`)
                .setDescription(description.join('\n'))
                .setTimestamp()
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }) });

            // Delete the status message and send the embed
            msg.delete().catch(() => { });
            message.reply({ embeds: [embed] });
        } else if (['continent', 'state'].includes(option)) {
            // If no continent or state was specified return an error
            if (!args[1]) return message.error(`You didn't specify a valid ${option}!`);

            // Send the status message and get the stats
            const msg = await message.loadingReply('Fetching data');
            const stats = option === 'state' ? await getDataByState(args.slice(1).join(' ').toLowerCase()) : await getDataByContinent(args.slice(1).join(' ').toLowerCase());

            // If no state/continent was found return an error
            if (!stats || stats.message) return msg.edit(`${bot.config.emojis.error} ${stats?.message ? stats.message : `${option.toTitleCase()} not found or doesn't have any cases.`}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`COVID-19 Statistics for ${stats.continent ?? stats.state}`)
                .setThumbnail('https://i.imgur.com/2K1x0bS.png')
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setFooter({ text: 'Updated', iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setTimestamp(stats.updated)
                .addField('Overall Statistics', stripIndents`Totals: **${stats.cases.toLocaleString()}**
                    Deaths: **${stats.deaths.toLocaleString()}**
                    Recovered: **${stats.recovered.toLocaleString()}**
                    Tests: **${stats.tests.toLocaleString()}**`, true)
                .addField('Today', stripIndents`Cases: **${stats.todayCases.toLocaleString()}**
                    Deaths: **${stats.todayDeaths.toLocaleString()}**${stats.todayRecovered ? `\nRecovered: **${stats.todayRecovered.toLocaleString()}**` : ''}`, true)
                .addField('Other Stats', stripIndents`${stats.countries ? `Countries: **${stats.countries.length}**\n` : ''}Population: **${stats.population.toLocaleString()}**
                    Active Cases: **${stats.active.toLocaleString()}**${stats.critical ? `\nCritical Cases: **${stats.critical.toLocaleString()}**` : ''}`, false);

            // Delete the status message & send the embed
            msg.delete().catch(() => { });
            message.reply({ embeds: [embed] });
        } else {
            // Send a status message and get the data
            const msg = await message.loadingReply('Fetching data...');
            const stats = await getDataByCountry(args.join(' ').toLowerCase());
            const vaccines = await getVaccineData(1, true, 'countries', stats?.country);

            // If no country was found return an error
            if (!stats || stats.message) return msg.edit(`${bot.config.emojis.error} ${stats?.message ? stats.message : 'Country not found or doesn\'t have any cases.'}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`COVID-19 Statistics for ${stats.country}`)
                .setThumbnail(stats.countryInfo.flag)
                .setColor(message.member?.displayColor || bot.config.general.embedColor)
                .setFooter({ text: 'Updated', iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setTimestamp(stats.updated)
                .addField('Overall Statistics', stripIndents`Cases: **${stats.cases.toLocaleString()}**
                    Deaths: **${stats.deaths.toLocaleString()}**
                    Recovered: **${stats.recovered.toLocaleString()}**
                    Tests: **${stats.tests.toLocaleString()}**
                    Vaccinations: **${vaccines?.timeline[0].total.toLocaleString()}**`, true)
                .addField('Today', stripIndents`Cases: **${stats.todayCases.toLocaleString()}**
                    Deaths: **${stats.todayDeaths.toLocaleString()}**
                    Recovered: **${stats.todayRecovered.toLocaleString()}**`, true)
                .addField('Other Stats', stripIndents`Population: **${stats.population.toLocaleString()}**
                    Active Cases: **${stats.active.toLocaleString()}**
                    Critical Cases: **${stats.critical.toLocaleString()}**`, false);

            // Delete the status message & send the embed
            msg.delete().catch(() => { });
            message.reply({ embeds: [embed] });
        }
    },

    run_interaction: async (bot, interaction) => {
        // Get the subcommand used
        const sub = interaction.options.getSubcommand();

        if (sub === 'global') {
            // Defer the interaction
            await interaction.deferReply();

            // Get the stats and vaccine data
            const stats = await getGlobalStats();
            const vaccines = await getVaccineData(1, true);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle('Global COVID-19 Statistics')
                .setThumbnail('https://i.imgur.com/2K1x0bS.png')
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setFooter({ text: 'Updated', iconUrl: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setTimestamp(stats.updated)
                .addField('Overall Statistics', stripIndents`Cases: **${stats.cases.toLocaleString()}**
                    Deaths: **${stats.deaths.toLocaleString()}**
                    Recovered: **${stats.recovered.toLocaleString()}**
                    Tests: **${stats.tests.toLocaleString()}**
                    Vaccinations: **${vaccines[0].total.toLocaleString()}**`, true)
                .addField('Today', stripIndents`Cases: **${stats.todayCases.toLocaleString()}**
                    Deaths: **${stats.todayDeaths.toLocaleString()}**
                    Recovered: **${stats.todayRecovered.toLocaleString()}**`, true)
                .addField('Other Stats', stripIndents`Countries Affected: **${stats.affectedCountries}**
                    Population: **${stats.population.toLocaleString()}**
                    Active Cases: **${stats.active.toLocaleString()}**
                    Critical Cases: **${stats.critical.toLocaleString()}**`, false);

            // Send the embed
            interaction.editReply({ embeds: [embed] });
        } else if (sub === 'top') {
            // Defer the interaction
            await interaction.deferReply();

            // Get the sort option
            const opt = interaction.options.get('option').value;

            // Get the stats, reduce them to just the top 10 and format them
            const stats = await getAllCountryData(opt);
            const top10 = stats.splice(0, 10);
            const description = top10.map((a, index) => `**${index + 1}.** ${a.country} | \`${a.cases.toLocaleString()}\` ${opt}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`Countries with the most COVID-19 ${opt}`)
                .setDescription(description.join('\n'))
                .setTimestamp()
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconUrl: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }) });

            // Delete the status message and send the embed
            interaction.editReply({ embeds: [embed] });
        } else if (sub === 'state' || sub === 'continent') {
            // Defer the interaction
            await interaction.deferReply();

            // Send the status message and get the stats
            const stats = sub === 'state' ? await getDataByState(interaction.options.get('state').value.toLowerCase()) : await getDataByContinent(interaction.options.get('continent').value.toLowerCase());

            // If no state/continent was found return an error
            if (!stats || stats.message) return interaction.editReply(`${bot.config.emojis.error} ${stats?.message ? stats.message : `${sub === 'state' ? 'State' : 'Continent'} not found or doesn't have any cases.`}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`COVID-19 Statistics for ${stats.continent ?? stats.state}`)
                .setThumbnail('https://i.imgur.com/2K1x0bS.png')
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setFooter({ text: 'Updated', iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setTimestamp(stats.updated)
                .addField('Overall Statistics', stripIndents`Totals: **${stats.cases.toLocaleString()}**
                    Deaths: **${stats.deaths.toLocaleString()}**
                    Recovered: **${stats.recovered.toLocaleString()}**
                    Tests: **${stats.tests.toLocaleString()}**`, true)
                .addField('Today', stripIndents`Cases: **${stats.todayCases.toLocaleString()}**
                    Deaths: **${stats.todayDeaths.toLocaleString()}**${stats.todayRecovered ? `\nRecovered: **${stats.todayRecovered.toLocaleString()}**` : ''}`, true)
                .addField('Other Stats', stripIndents`${stats.countries ? `Countries: **${stats.countries.length}**\n` : ''}Population: **${stats.population.toLocaleString()}**
                    Active Cases: **${stats.active.toLocaleString()}**${stats.critical ? `\nCritical Cases: **${stats.critical.toLocaleString()}**` : ''}`, false);

            // Delete the status message & send the embed
            interaction.editReply({ embeds: [embed] });
        } else if (sub === 'country') {
            // Defer the interaction
            await interaction.deferReply();

            // Get the stats
            const stats = await getDataByCountry(interaction.options.get('country').value.toLowerCase());
            const vaccines = await getVaccineData(1, true, 'countries', stats?.country);

            // If no country was found return an error
            if (!stats || stats.message) return interaction.editReply(`${bot.config.emojis.error} ${stats?.message ? stats.message : 'Country not found or doesn\'t have any cases.'}`);

            // Build the embed
            const embed = new MessageEmbed()
                .setTitle(`COVID-19 Statistics for ${stats.country}`)
                .setThumbnail(stats.countryInfo.flag)
                .setColor(interaction.member?.displayColor ?? bot.config.general.embedColor)
                .setFooter({ text: 'Updated', iconUrl: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }) })
                .setTimestamp(stats.updated)
                .addField('Overall Statistics', stripIndents`Cases: **${stats.cases.toLocaleString()}**
                    Deaths: **${stats.deaths.toLocaleString()}**
                    Recovered: **${stats.recovered.toLocaleString()}**
                    Tests: **${stats.tests.toLocaleString()}**
                    Vaccinations: **${vaccines?.timeline[0].total.toLocaleString()}**`, true)
                .addField('Today', stripIndents`Cases: **${stats.todayCases.toLocaleString()}**
                    Deaths: **${stats.todayDeaths.toLocaleString()}**
                    Recovered: **${stats.todayRecovered.toLocaleString()}**`, true)
                .addField('Other Stats', stripIndents`Population: **${stats.population.toLocaleString()}**
                    Active Cases: **${stats.active.toLocaleString()}**
                    Critical Cases: **${stats.critical.toLocaleString()}**`, false);

            interaction.editReply({ embeds: [embed] });
        }
    },
};
