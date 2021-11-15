const { MessageEmbed } = require('discord.js');
const giveaways = require('../../database/models/giveaways');
const { getUser } = require('../functions/getters');
const { drawGiveawayWinners } = require('../functions/misc');

/**
 * Initialize the checkGiveaways task
 *
 * @param {Object} bot
 */
exports.init = async (bot) => {
    /**
     * Fetch all giveaways in the giveaways DB and send the winners if the giveaway is due
     *
     * @param {Object} bot
     */
    // eslint-disable-next-line no-shadow
    const checkGiveaways = async (bot) => {
        const g = await giveaways.find({ active: true });

        for (const data of g) {
            if (Date.now() >= data.timestamps.ends) {
                // Get the winners and define the array
                const winners = drawGiveawayWinners(data.entries, data.winners);
                const arr = [];

                // Loop through the winners
                for (const i of (winners)) {
                    // Get the user
                    const user = await getUser(bot, null, i);

                    // If the user exists add it to the array otherwise add <deleted user>
                    if (user) {
                        arr.push(user);
                    } else {
                        arr.push('<deleted user>');
                    }
                }

                // Get the guild, channel, message and giveaway creator
                const guild = bot.guilds.cache.get(data.guild.guild_id) || await bot.guilds.fetch(data.guild.guild_id).catch(() => {});
                const channel = guild?.channels.cache.get(data.guild.channel_id);
                const msg = await channel?.messages.fetch(data.guild.message_id).catch(() => {});
                const creator = guild?.members.cache.get(data.creator);

                if (!guild) return;

                // Build the embed
                const embed = new MessageEmbed()
                    .setAuthor(`Giveaway: ${data.prize}`, guild.iconURL({ dynamic: true, format: 'png' }))
                    // eslint-disable-next-line no-nested-ternary
                    .setDescription(`${arr.length ? arr.length > 1 ? `**Winners:**\n${arr.join('\n')}` : `**Winner:** ${arr.join('\n')}` : 'Could not determine a winner!'}\n**Hosted By:** ${creator}`)
                    .setTimestamp(Date.now())
                    .setColor(bot.config.general.embedColor)
                    .setFooter(`${data.winners} winners | Ended at`);

                // Update the embed
                msg?.edit({ embeds: [embed] });

                // Set the giveaway to inactive in the db
                await giveaways.findOneAndUpdate({ 'guild.guild_id': guild.id, id: data.id }, {
                    active: false,
                });

                // If no winners were selected return an error otherwise announce the winners
                if (!arr.length) {
                    channel?.send(`${bot.config.emojis.error} A winner could not be determined!`);
                } else {
                    channel?.send(`🎉 Congratulations to ${arr.join(', ')} on winning the giveaway for \`${data.prize}\`!`);
                }
            }
        }

        return true;
    };

    // Run the checkReminders function
    await checkGiveaways(bot);

    // Run the checkReminders function every minute
    const interval = setInterval(async () => {
        await checkGiveaways(bot);
    }, 60000);

    // Return the interval info
    return interval;
};
