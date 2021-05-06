module.exports = async (bot, message) => {
    // If the message is partial try to fetch it before its fully deleted on discords side
    if (message.partial) {
        try {
            await message.fetch();
        } catch {
            return;
        }
    }

    // If the author is a bot return
    if (message.author.bot)
        return;
    // If the message was in dms return
    if (message.channel.type == "dm")
        return;

    // Create the msg object
    const msg = {
        channel: message.channel.id,
        author: {
            id: message.author.id,
            tag: message.author.tag
        },
        content: message.content,
        id: message.id,
        deletedTimestamp: Date.now()
    };

    // Add the deletedMsg to the collection
    bot.deletedMsgs.set(`${message.guild.id}-${message.channel.id}`, msg);
};