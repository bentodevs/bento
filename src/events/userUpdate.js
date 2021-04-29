const users = require("../database/models/users");

module.exports = async (bot, oldUser, newUser) => {

    // Check if the user changed their name
    if (oldUser.username !== newUser.username) {
        // TODO: [BOT-9] Add a check for users who don't want their username tracked
        // Check if the user is already in the database
        if (!await users.findOne({ _id: newUser.id })) {
            // If the user wasn't in the database create a new database object
            await users.create({
                _id: newUser.id,
                usernames: [
                    {
                        username: newUser.username,
                        time: Date.now()
                    }
                ]
            });
        } else {
            // If the user was in the database push the new username to the database
            await users.findOneAndUpdate({ _id: newUser.id }, {
                $push: {
                    usernames: {
                        username: newUser.username,
                        time: Date.now()
                    }
                }
            });
        }
    }

};