const punishments = require("../../database/models/punishments");

module.exports = {
    info: {
        name: "reason",
        aliases: [],
        usage: "reason <case> <reason>",
        examples: ["reason 69 Reason v2 lol"],
        description: "Update the reason for a moderation case",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "MANAGE_MESSAGES",
        type: "discord",
        self: []
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: true,
        disabled: false
    },

    run: async (bot, message, args) => {

        const punishment = await punishments.findOne({ id: args[0], guild: message.guild.id });

        if (!punishment)
            return message.errorReply("You must specify a valid case!");
        
        if (!args[1])
            return message.errorReply("You must provice a new punishment reason!");
        
        const reason = args.splice(1).join(" "); 

        await punishments.findOneAndUpdate({ id: args[0], guild: message.guild.id }, { reason: reason })
            .then(() => message.confirmationReply(`The reason for ${punishment.id} has been updated to ${reason}`))
            .catch((err) => message.errorReply(`I encountered an error whilst updating the reason for ${punishment.id}: \`${err.message}\``));
    }
};