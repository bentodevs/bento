const config = require("../../config");

exports.checkSelf = async (message, cmd) => {
    // If the command was run in dms return false
    if (!message.guild)
        return false;

    // If the bot doesn't have send messages permissions send the user a dm and return true
    if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
        await message.author.send(`${config.emojis.error} I don't have permissions to send messages in the channel you ran your command in!`)
            .catch(() => {});

        return true;
    }

    // If the command has self permissions set check if the bot has those permissions
    if (cmd.perms.self.length) {
        // Loop through the self permissions
        for (const data of cmd.perms.self) {
            // If the bot doesn't have one of the permissions return an error and true
            if (!message.channel.permissionsFor(message.guild.me).has(data)) {
                await message.error(`I am lacking the permission \`${data}\`!`)
                    .catch(() => {});

                return true;
            }
        }
    }

    // Return false if all the checks passed
    return false;
};