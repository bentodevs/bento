module.exports = async (bot, oldMsg, newMsg) => {
    // If the message is partial return
    if (newMsg.partial)
        return;
    // If the author is a bot return
    if (newMsg.author.bot) 
        return;
    // If only an embed updated return
    if (oldMsg.content == newMsg.content && oldMsg.embeds !== newMsg.embeds) 
        return;
    // If the message is in a dm return
    if (oldMsg.channel.type === "dm")
        return;

    // Add the msg id to the editedMsgs collection
    bot.editedMsgs.set(`${newMsg.guild.id}-${newMsg.channel.id}`, newMsg.id);
};