
const config = require("../../config");
const { registerGuild } = require("../../modules/handlers/command");

module.exports = {
    info: {
        name: "registerguildcommands",
        aliases: ["rgc"],
        usage: "registerguildcommands <guildId | \"all\">",
        examples: [],
        description: "Re-register application commands for a specific guild/all guilds",
        category: "Dev",
        info: null,
        options: []
    },
    perms: {
        permission: "",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: true,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        if (args[0].toLowerCase() == "all") {

            // Fetch all guilds and map by guild id
            const guilds = await bot.guilds.fetch().then(a => a.map(g => g.id));

            // Chunk the guilds into sub-arrays, with a max of 5 guilds per array
            const chunked = Array.from({ length: Math.ceil(guilds.length / 5) }, (v, i) =>
                guilds.slice(i * 5, i * 5 + 5));

            // Send a loading message
            const loading = await message.loadingReply(`Starting to update commands for ${guilds.length} guilds...`);

            // Set part integer
            let i = 0;

            // Create interval to handle 1 chunk per 5s
            const toUpdate = setInterval(async () => {
                // Get the chunk
                const guilds = chunked[i];

                for (const data of guilds) {
                    // Register guild commands for the guild
                    // Catch any errors
                    await registerGuild(bot, data).catch((err) => bot.logger.debug(`Failed to update commands for ${data}: ${err.message} `));
                }

                // Increment the part

                i++;

                // If all chunks have been updated, send confirm and clear the interval
                if (i == chunked.length) {
                    loading.edit(`${config.emojis.confirmation} Guild commands have been updated!`);
                    return clearInterval(toUpdate);
                }
            }, 5000);

        } else if (parseInt(args[0]) && /^[0-9]{16,}$/.test(args[0])) {

            // Set failed variable to false by default
            let failed = false;

            // Fetch the guild
            const guild = await bot.guilds.fetch(args[0])
                .catch((err) => {
                    message.errorReply(`Failed to fetch the requested guild: \`${err.message}\``);
                    failed = true;
                });

            // If failed, return
            if (failed)
                return;

            // If the guild is not available, then return an error
            if (!guild.available)
                return message.errorReply("That guild is not currently available! *It's possible Discord may be experiencing issues*");

            // Register the guild, catch any errors
            await registerGuild(bot, guild.id)
                .then(() => message.confirmationReply(`Successfully registed guild-only application commands for ${guild.name} (\`${guild.id}\`)`))
                .catch((err) => message.errorReply(`Failed to register guild-only application commands for ${guild.name} (\`${guild.id}\`): \`${err.message}\``));
        } else {
            // Throw error
            message.errorReply(`You must either specify \`all\` or a Guild ID`);
        }
    }
};