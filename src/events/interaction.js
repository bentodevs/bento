const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getSettings } = require("../database/mongo");

module.exports = async (bot, interaction) => {

    if (interaction.isMessageComponent() && interaction.componentType == "BUTTON") {
        // Button Code
    } else if (interaction.isCommand()) {
        if (interaction.user.bot)
            return;

        const settings = interaction.settings = await getSettings(interaction.guild?.id);

        if (interaction.guild && !interaction.member)
            await interaction.guild.members.fetch(interaction.user);

        require("../modules/functions/interactions")(interaction);

        const cmd = bot.commands.get(interaction.commandName);

        if (!cmd)
            return interaction.error("The command you ran wasn't found!", { ephemeral: true });

        if (cmd.opts.disabled && !bot.config.general.devs.includes(interaction.user.id))
            return interaction.error("This command is currently disabled!", { ephemeral: true });

        if (cmd.opts.guildOnly && !interaction.guild)
            return interaction.error("This command is unavailable via private messages. Please run this command in a guild.", { ephemeral: true });

        if (interaction.guild && (settings.general.disabled_commands?.includes(cmd.info.name) || settings.general.disabled_categories?.includes(cmd.info.category)) && !interaction.channel.permissionsFor(interaction.member).has("ADMINISTRATOR") && !bot.config.general.devs.includes(interaction.user.id))
            return interaction.error("This command (or the category the command is in) is currently disabled!", { ephemeral: true });

        try {
            cmd.run_interaction ? await cmd.run_interaction(bot, interaction) : await cmd.run(bot, interaction);
        } catch (err) {
            const guild = bot.guilds.cache.get(bot.config.general.errors.guild) || await bot.guilds.fetch(bot.config.general.errors.guild).catch(() => {}),
            channel = guild?.channels.cache.get(bot.config.general.errors.channel);

            const embed = new MessageEmbed()
                .setAuthor(`An error occured in ${interaction.guild?.name ?? `${interaction.user.tag}'s dms`}`, "https://i.imgur.com/e7xORGp.png")
                .setThumbnail("https://i.imgur.com/e7xORGp.png")
                .setDescription(stripIndents`**Guild ID:** ${interaction.guild?.id ?? "<dms>"}
                **Interaction Author:** ${interaction.user.tag} (${interaction.user.id})
                **Interaction ID:** ${interaction.id}
                **Command:** ${cmd.info.name}
                
                **Error:**\`\`\`${err.stack}\`\`\``)
                .setColor("#FF2D00");

            channel?.send(embed);

            interaction.error(stripIndents`An error occurred while running the command: \`${err}\`
            
            ${bot.config.emojis.url} If this issue persists please report it in our discord: ${bot.config.general.errors.url}`, { ephemeral: true });
        }
    }
};