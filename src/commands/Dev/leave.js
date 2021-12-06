import { stripIndents } from 'common-tags';
import { MessageActionRow, MessageButton } from 'discord.js';

export default {
    info: {
        name: 'leave',
        aliases: [
            'leaveserver',
        ],
        usage: 'leave <guild id | "this">',
        examples: [
            'leave this',
            'leave 839939523231875082',
        ],
        description: 'Force leaves a discord.',
        category: 'Dev',
        info: null,
        options: [],
    },
    perms: {
        type: 'dev',
        self: [],
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        noArgsHelp: true,
        disabled: false,
    },

    run: async (bot, message, args) => {
        // Get the guild
        const guild = args[0].toLowerCase() === 'this' ? message.guild ?? null : await bot.guilds.fetch(args[0]).catch(() => {});

        // If the guild wasn't found return an error
        if (!guild) return message.errorReply("You didn't specify a valid guild!");

        // Set the customId
        const customId = `${Date.now()}-${message.author.id}`;

        // Create the yes/no buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`${customId}-yes`)
                    .setLabel('Yes')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId(`${customId}-no`)
                    .setLabel('No')
                    .setStyle('DANGER'),
            );

        // Send a message asking if the user is sure
        const msg = await message.reply({ content: stripIndents(`Are you sure you want me to leave \`${guild.name} (${guild.id})\`?`), components: [row] });

        // Create the filter
        const filter = (i) => {
            i.deferUpdate();
            return i.user.id === message.author.id;
        };

        // Await a button click
        message.channel.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 30000 }).then(async (i) => {
            if (i.customId.endsWith('yes')) {
                if (guild.id === message.guild.id) {
                    // Delete the message & leave the guild
                    await i.message.delete().catch(() => {});
                    await guild.leave();

                    // Send the author a confirmation message
                    message.author.send(`${bot.config.emojis.confirmation} Successfully left \`${guild.name} (${guild.id})\`!`);
                } else {
                    // Leave the guild and update the message
                    await guild.leave();
                    await i.message.edit({ content: `${bot.config.emojis.confirmation} Successfully left \`${guild.name} (${guild.id})\`!`, components: [] });
                }
            } else {
                // Update the message
                await i.message.edit({ content: `${bot.config.emojis.confirmation} The command has been canceled.`, components: [] });
            }
        }).catch(async () => {
            // Update the message
            await msg.edit({ content: `${bot.config.emojis.confirmation} The command has been canceled.`, components: [] });
        });
    },
};
