import { Client, MessageReaction, User } from 'discord.js';
import giveaways from '../database/models/giveaways.js';
import reactroles from '../database/models/reactroles.js';
import logger from '../logger';
import { getReactCooldown } from '../modules/functions/misc.js';

export default async (bot: Client, reaction: MessageReaction, user: User) => {
    // If the reaction or user are partial try to fetch them
    if (reaction.partial || user.partial) {
        try {
            await reaction.fetch();
            await user.fetch();
        } catch (err) {
            return logger.error(err);
        }
    }

    // If the user is a bot ignore the reaction
    if (user.bot) return;
    // If the reaction isn't in a guild ignore the reaction
    if (!reaction.message.guild) return;

    // Check if the reaction message is a giveaway message
    const reactRole = await reactroles.findOne({ message: reaction.message.id });
    const giveaway = await giveaways.findOne({ 'guild.message_id': reaction.message.id, active: true });

    // Handle reactroles
    if (reactRole) {
        // Get the emote
        const emote = reactRole.roleIds.find((r) => r.emoji === reaction.emoji.name) || reactRole.roleIds.find((r) => r.emoji === reaction.emoji.id);

        // If the emote wasn't found return
        if (!emote) return;

        // Grab the role and the member
        const role = await reaction.message.guild.roles.fetch(emote.role);
        const member = await reaction.message.guild.members.fetch(user.id);

        // If the role wasn't found or the user is on cooldown return
        if (!role) return;
        if (getReactCooldown(user, reaction.message.guild.id)) return;

        // If the user has the role remove it, otherwise add it
        if (member.roles.cache.has(role.id)) {
            member.roles.remove(role.id, 'Reaction Role');
        } else {
            member.roles.add(role.id, 'Reaction Role');
        }

        // Remove the users reaction
        reaction.users.remove(user.id);

        // Return
        return;
    }

    // If the reaction is a giveaway message add the users reaction to the entries
    if (giveaway) {
        await giveaways.findOneAndUpdate({ 'guild.message_id': reaction.message.id, active: true }, {
            $addToSet: {
                entries: user.id,
            },
        });
    }
};
