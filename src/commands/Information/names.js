const users = require("../../database/models/users");
const { getMember, getUser } = require("../../modules/functions/getters");

module.exports = {
    info: {
        name: "names",
        aliases: [
            "usernames",
            "namehistory",
            "namehist"
        ],
        usage: "names [user]",
        examples: [
            "names Jarno"
        ],
        description: "Displays a users username history.",
        category: "Information",
        info: "Usernames will only be tracked when the user is in at least 1 discord this bot is in. This command will not show any data from before this bot was created or before the user joined a Discord this bot was in.",
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "role",
        self: []
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        noArgsHelp: false,
        disabled: false
    },

    run: async (bot, message, args) => {

        // Grab the user or guild member
        const user = await getMember(message, args.join(" "), true) || await getUser(bot, message, args.join(" "), true);

        // If no user/member was found return an error
        if (!user)
            return message.error("You didn't specify a valid user!");

        // Grab the data
        const data = await users.findOne({ _id: user.id });

        // If no data was found return an error
        if (!data)
            return message.error("I don't have any data on the user you specified!");
        // If the user only has 1 name return an error
        if (data.usernames.length <= 1)
            return message.error("I don't remember any name changes for this user!");

        // Sort the usernames and create a map with only the usernames
        const sorted = data.usernames.sort((a, b) => b.time - a.time),
        usernames = sorted.map(a => a.username);

        // Send a message with the usernames
        message.confirmation(`Last **${usernames.length}** names for **${user.user?.tag ?? user.tag}:** \`${usernames.join("`, `")}\``);

    }
};