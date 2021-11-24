const { stripIndents } = require('common-tags');
const { formatDistance } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const { default: fetch } = require('node-fetch');
const { fetchSteamUserByName, fetchSteamUserByID } = require('../../modules/functions/misc');

module.exports = {
    info: {
        name: 'csgo',
        aliases: [],
        usage: 'csgo <steam name or id>',
        examples: [],
        description: 'Fetch information about a CS:GO player',
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
        disabled: false,
    },
    slash: {
        enabled: true,
        opts: [{
            name: 'steam_name_or_id',
            type: 'STRING',
            description: 'Your steam username or ID.',
            required: true,
        }],
    },

    run: async (bot, message, args) => {
        if (!isNaN(args[0]) && /^[0-9]{7,}$/.test(args[0])) {
            await fetchSteamUserByID(args[0])
                .then(async (data) => {
                    await fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${bot.config.apiKeys.steam}&steamid=${data.steamID}`)
                        .then(async (csUser) => {
                            const user = await csUser.json();
                            const timePlayed = formatDistance(0, new Date(user.playerstats.stats.find((a) => a.name === 'total_time_played').value * 1000), 'PPp');

                            const embed = new MessageEmbed()
                                .setAuthor(`CS:GO Player Stats: ${data.profileInfo.name}`, 'https://i.imgur.com/ekIx2st.png')
                                .setThumbnail(data.avatar.full)
                                .setColor(message.member.displayColor ?? bot.config.embedColor)
                                .setDescription(stripIndents`**K/D:** ${(user.playerstats.stats.find((a) => a.name === 'total_kills').value / user.playerstats.stats.find((a) => a.name === 'total_deaths').value).toFixed(2)} (**Kills:** ${user.playerstats.stats.find((a) => a.name === 'total_kills').value} | **Deaths:** ${user.playerstats.stats.find((a) => a.name === 'total_deaths').value})
                                **Accuracy:** ${((user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value / user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value) * 100).toFixed(2)}% (${user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value} **shots fired** | ${user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value} **shots hit**)
                                **W/L:** ${(user.playerstats.stats.find((a) => a.name === 'total_wins').value / user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value).toFixed(2)} (${user.playerstats.stats.find((a) => a.name === 'total_wins').value} **wins** | ${user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value} **matches played**)
                                **Damage Dealt:** ${user.playerstats.stats.find((a) => a.name === 'total_damage_done').value}

                                **Total time played:** ${timePlayed}
                                ${user.playerstats.stats.find((a) => a.name === 'total_planted_bombs')?.value || 0} **bombs planted** | ${user.playerstats.stats.find((a) => a.name === 'total_defused_bombs')?.value || 0} **bombs defused**
                                **Money Earned:** ${user.playerstats.stats.find((a) => a.name === 'total_money_earned').value}`)
                                .setTimestamp()
                                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: 'png' }));

                            message.reply({ embeds: [embed] });
                        })
                        .catch((e) => message.errorReply(`I encountered an error whilst getting the requested stats: \`${e.message}\``));
                })
                .catch(() => message.errorReply("I couldn't find a user with that ID!"));
        } else {
            await fetchSteamUserByName(args[0])
                .then(async (data) => {
                    await fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${bot.config.apiKeys.steam}&steamid=${data.steamID}`)
                        .then(async (csUser) => {
                            const user = await csUser.json();
                            const timePlayed = formatDistance(0, new Date(user.playerstats.stats.find((a) => a.name === 'total_time_played').value * 1000), 'PPp');

                            const embed = new MessageEmbed()
                                .setAuthor(`CS:GO Player Stats: ${data.profileInfo.name}`, 'https://i.imgur.com/ekIx2st.png')
                                .setThumbnail(data.avatar.full)
                                .setColor(message.member.displayColor ?? bot.config.embedColor)
                                .setDescription(stripIndents`**K/D:** ${(user.playerstats.stats.find((a) => a.name === 'total_kills').value / user.playerstats.stats.find((a) => a.name === 'total_deaths').value).toFixed(2)} (**Kills:** ${user.playerstats.stats.find((a) => a.name === 'total_kills').value} | **Deaths:** ${user.playerstats.stats.find((a) => a.name === 'total_deaths').value})
                                **Accuracy:** ${((user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value / user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value) * 100).toFixed(2)}% (${user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value} **shots fired** | ${user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value} **shots hit**)
                                **W/L:** ${(user.playerstats.stats.find((a) => a.name === 'total_wins').value / user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value).toFixed(2)} (${user.playerstats.stats.find((a) => a.name === 'total_wins').value} **wins** | ${user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value} **matches played**)
                                **Damage Dealt:** ${user.playerstats.stats.find((a) => a.name === 'total_damage_done').value}

                                **Total time played:** ${timePlayed}
                                ${user.playerstats.stats.find((a) => a.name === 'total_planted_bombs')?.value || 0} **bombs planted** | ${user.playerstats.stats.find((a) => a.name === 'total_defused_bombs')?.value || 0} **bombs defused**
                                **Money Earned:** ${user.playerstats.stats.find((a) => a.name === 'total_money_earned').value}`)
                                .setTimestamp()
                                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, format: 'png' }));

                            message.reply({ embeds: [embed] });
                        })
                        .catch((e) => message.errorReply(`I encountered an error whilst getting the requested stats: \`${e.message}\``));
                })
                .catch(() => message.errorReply("I couldn't find a user with that username!"));
        }
    },

    run_interaction: async (bot, interaction) => {
        // Defer the interaction
        await interaction.deferReply();

        // Get the data from the interaction
        const option = interaction.options.get('steam_name_or_id').value;

        if (!isNaN(option) && /^[0-9]{7,}$/.test(option)) {
            await fetchSteamUserByID(option)
                .then(async (data) => {
                    await fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${bot.config.apiKeys.steam}&steamid=${data.steamID}`)
                        .then(async (csUser) => {
                            const user = await csUser.json();
                            const timePlayed = formatDistance(0, new Date(user.playerstats.stats.find((a) => a.name === 'total_time_played').value * 1000), 'PPp');

                            const embed = new MessageEmbed()
                                .setAuthor(`CS:GO Player Stats: ${data.profileInfo.name}`, 'https://i.imgur.com/ekIx2st.png')
                                .setThumbnail(data.avatar.full)
                                .setColor(interaction.member?.displayColor ?? bot.config.embedColor)
                                .setDescription(stripIndents`**K/D:** ${(user.playerstats.stats.find((a) => a.name === 'total_kills').value / user.playerstats.stats.find((a) => a.name === 'total_deaths').value).toFixed(2)} (**Kills:** ${user.playerstats.stats.find((a) => a.name === 'total_kills').value} | **Deaths:** ${user.playerstats.stats.find((a) => a.name === 'total_deaths').value})
                                **Accuracy:** ${((user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value / user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value) * 100).toFixed(2)}% (${user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value} **shots fired** | ${user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value} **shots hit**)
                                **W/L:** ${(user.playerstats.stats.find((a) => a.name === 'total_wins').value / user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value).toFixed(2)} (${user.playerstats.stats.find((a) => a.name === 'total_wins').value} **wins** | ${user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value} **matches played**)
                                **Damage Dealt:** ${user.playerstats.stats.find((a) => a.name === 'total_damage_done').value}

                                **Total time played:** ${timePlayed}
                                ${user.playerstats.stats.find((a) => a.name === 'total_planted_bombs')?.value || 0} **bombs planted** | ${user.playerstats.stats.find((a) => a.name === 'total_defused_bombs')?.value || 0} **bombs defused**
                                **Money Earned:** ${user.playerstats.stats.find((a) => a.name === 'total_money_earned').value}`)
                                .setTimestamp()
                                .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true, format: 'png' }));

                            interaction.editReply({ embeds: [embed] });
                        })
                        .catch((e) => interaction.editReply(`${bot.config.emojis.error} I encountered an error whilst getting the requested stats: \`${e.message}\``));
                })
                .catch(() => interaction.editReply(`${bot.config.emojis.error} I couldn't find a user with that ID!`));
        } else {
            await fetchSteamUserByName(option)
                .then(async (data) => {
                    await fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${bot.config.apiKeys.steam}&steamid=${data.steamID}`)
                        .then(async (csUser) => {
                            const user = await csUser.json();
                            const timePlayed = formatDistance(0, new Date(user.playerstats.stats.find((a) => a.name === 'total_time_played').value * 1000), 'PPp');

                            const embed = new MessageEmbed()
                                .setAuthor(`CS:GO Player Stats: ${data.profileInfo.name}`, 'https://i.imgur.com/ekIx2st.png')
                                .setThumbnail(data.avatar.full)
                                .setColor(interaction.member?.displayColor ?? bot.config.embedColor)
                                .setDescription(stripIndents`**K/D:** ${(user.playerstats.stats.find((a) => a.name === 'total_kills').value / user.playerstats.stats.find((a) => a.name === 'total_deaths').value).toFixed(2)} (**Kills:** ${user.playerstats.stats.find((a) => a.name === 'total_kills').value} | **Deaths:** ${user.playerstats.stats.find((a) => a.name === 'total_deaths').value})
                                **Accuracy:** ${((user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value / user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value) * 100).toFixed(2)}% (${user.playerstats.stats.find((a) => a.name === 'total_shots_fired').value} **shots fired** | ${user.playerstats.stats.find((a) => a.name === 'total_shots_hit').value} **shots hit**)
                                **W/L:** ${(user.playerstats.stats.find((a) => a.name === 'total_wins').value / user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value).toFixed(2)} (${user.playerstats.stats.find((a) => a.name === 'total_wins').value} **wins** | ${user.playerstats.stats.find((a) => a.name === 'total_rounds_played').value} **matches played**)
                                **Damage Dealt:** ${user.playerstats.stats.find((a) => a.name === 'total_damage_done').value}

                                **Total time played:** ${timePlayed}
                                ${user.playerstats.stats.find((a) => a.name === 'total_planted_bombs')?.value || 0} **bombs planted** | ${user.playerstats.stats.find((a) => a.name === 'total_defused_bombs')?.value || 0} **bombs defused**
                                **Money Earned:** ${user.playerstats.stats.find((a) => a.name === 'total_money_earned').value}`)
                                .setTimestamp()
                                .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true, format: 'png' }));

                            interaction.editReply({ embeds: [embed] });
                        })
                        .catch((e) => interaction.editReply(`${bot.config.emojis.error} I encountered an error whilst getting the requested stats: \`${e.message}\``));
                })
                .catch(() => interaction.editReply(`${bot.config.emojis.error} I couldn't find a user with that username!`));
        }
    },
};
