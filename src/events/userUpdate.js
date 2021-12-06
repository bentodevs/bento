import users from '../database/models/users.js';

export default async (bot, oldUser, newUser) => {
    // Check if the user is a partial and try to fetch it
    if (newUser.partial) {
        try {
            await newUser.fetch();
        } catch (err) {
            return bot.logger.error(err);
        }
    }

    // Check if the user changed their name
    if (oldUser.username !== newUser.username) {
        // Check if the user is already in the database
        if (!await users.findOne({ _id: newUser.id })) {
            // If the user wasn't in the database create a new database object
            await users.create({
                _id: newUser.id,
                track: {
                    usernames: true,
                },
                usernames: [
                    {
                        username: newUser.username,
                        time: Date.now(),
                    },
                ],
            });
        } else {
            // If the user doesn't want their username tracked, then return
            if (!await users.findOne({ _id: newUser.id })?.track?.usernames) return;

            // If the user was in the database push the new username to the database
            await users.findOneAndUpdate({ _id: newUser.id }, {
                $push: {
                    usernames: {
                        username: newUser.username,
                        time: Date.now(),
                    },
                },
            });
        }
    }
};
