export default {
    info: {
        name: 'massban',
        aliases: [],
        usage: 'massban <id 1> | <id 2> | ... [| reason]',
        examples: [],
        description: 'Bans multiple users at once.',
        category: 'Moderation',
        info: null,
        options: [],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: ['BAN_MEMBERS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: true,
        noArgsHelp: true,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        // Split the args based on the |
        const ids = args.join(' ').split('|').map((i) => i.trim());

        // Check if the last arg is a reason
        let banReason = ids.pop();

        // Create a new array to store IDs that match the regex
        const validIDs = [];

        // Create Regex for ids
        const match = /\d{17,19}/g;

        for (const data of ids) {
            if (data.match(match)) {
                validIDs.push(data);
            }
        }

        // If the last element of the array isn't an ID, then set a default reason
        if (banReason.match(match)) banReason = 'No reason provided.';

        message.guild.members.fetch({ user: validIDs, withPresences: false }).then((members) => {
            members.forEach(async (member) => {
                member.ban({ reason: banReason });
            });
        }).catch((err) => {
            console.log(err);
        });
    },
};
