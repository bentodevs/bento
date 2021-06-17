const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { getSettings, getPerms } = require("../database/mongo");
const { checkBlacklist } = require("../modules/functions/moderation");
const { checkPerms, checkSelf } = require("../modules/functions/permissions");

module.exports = async (bot, interaction) => {

    if (interaction.isMessageComponent() && interaction.componentType == "BUTTON") {
        // Button Code
    } else if (interaction.isCommand()) {
        // Return if the user is a bot
        if (interaction.user.bot)
            return;

        // Get the settings and permissions
        const settings = interaction.settings = await getSettings(interaction.guild?.id),
        permissions = interaction.permissions = await getPerms(bot, interaction.guild?.id);

        // If the member isn't found try to fetch it
        if (interaction.guild && !interaction.member)
            await interaction.guild.members.fetch(interaction.user).catch(() => {});

        // Import the interaction functions
        require("../modules/functions/interactions")(interaction);

        // Get the command
        const cmd = bot.commands.get(interaction.commandName);

        // Check if the user is blacklisted
        if (await checkBlacklist(interaction))
            return;

        // If the command doesn't exist return an error
        if (!cmd)
            return interaction.error({ content: "The command you ran wasn't found!", ephemeral: true });
        // If the command is disabled return an error
        if (cmd.opts.disabled && !bot.config.general.devs.includes(interaction.user.id))
            return interaction.error({ content: "This command is currently disabled!", ephemeral: true });
        // If a guildOnly command is run in dms return an error
        if (cmd.opts.guildOnly && !interaction.guild)
            return interaction.error({ content: "This command is unavailable via private messages. Please run this command in a guild.", ephemeral: true });
        // If the command or category is disabled return an error
        if (interaction.guild && (settings.general.disabled_commands?.includes(cmd.info.name) || settings.general.disabled_categories?.includes(cmd.info.category)) && !interaction.channel.permissionsFor(interaction.member).has("ADMINISTRATOR") && !bot.config.general.devs.includes(interaction.user.id))
            return interaction.error({ content: "This command (or the category the command is in) is currently disabled!", ephemeral: true });

        // If the bot doesn't have permissions to run the command return
        if (await checkSelf(interaction, cmd))
            return;
        // Check if the user has permissions to run the command
        if (await checkPerms(bot, interaction, permissions, cmd))
            return interaction.error({ content: "You don't have permissions to run that command!", ephemeral: true });

        // Try to run the command
        try {
            // Run the command
            cmd.run_interaction ? await cmd.run_interaction(bot, interaction) : await cmd.run(bot, interaction);
        } catch (err) {
            // Get the error guild and channel
            const guild = bot.guilds.cache.get(bot.config.general.errors.guild) || await bot.guilds.fetch(bot.config.general.errors.guild).catch(() => {}),
            channel = guild?.channels.cache.get(bot.config.general.errors.channel);

            // Build the embed
            const embed = new MessageEmbed()
                .setAuthor(`An error occured in ${interaction.guild?.name ?? `${interaction.user.tag}'s dms`}`, "https://i.imgur.com/e7xORGp.png")
                .setThumbnail("https://i.imgur.com/e7xORGp.png")
                .setDescription(stripIndents`**Guild ID:** ${interaction.guild?.id ?? "<dms>"}
                **Interaction Author:** ${interaction.user.tag} (${interaction.user.id})
                **Interaction ID:** ${interaction.id}
                **Command:** ${cmd.info.name}
                
                **Error:**\`\`\`${err.stack}\`\`\``)
                .setColor("#FF2D00");

            // Send the embed
            channel?.send({ embeds: [embed] });

            // Send the error message to the user
            interaction.error({ content: stripIndents(`An error occurred while running the command: \`${err}\`
            
            ${bot.config.emojis.url} If this issue persists please report it in our discord: ${bot.config.general.errors.url}`), ephemeral: true });
        }
    }
};