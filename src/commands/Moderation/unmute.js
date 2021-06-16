const mutes = require("../../database/models/mutes");
const { punishmentLog } = require("../../modules/functions/moderation");
const { getMember } = require("../../modules/functions/getters");
const punishments = require("../../database/models/punishments");

module.exports = {
    info: {
        name: "unmute",
        aliases: [],
        usage: "unmute <user> [reason]",
        examples: [],
        description: "Unmute a user",
        category: "Moderation",
        info: null,
        options: []
    },
    perms: {
        permission: "",
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
    slash: {
        enabled: true,
        opts: [{
            name: "user",
            type: "USER",
            description: "The user you wish to unmute.",
            required: true
        }, {
            name: "reason",
            type: "STRING",
            description: "The reason for the unmute.",
            required: false
        }]
    },

    run: async (bot, message, args) => {
        // 1. Get the member requested
        // 2. get unmute reason
        // 3. Assign mute role to a const, cause easy
        // 4. Get mute data for the member
        const member = await getMember(message, args[0]),
            reason = args.splice(1, args.length).join(' ') || "No reason provided",
            muterole = message.settings.roles.mute,
            mute = await mutes.findOne({
                guild: message.guild.id,
                mutedUser: member?.id
            });

        // TODO: [BOT-78] Add case creation in non-slash unmute command
        // If no member was found return an error
        if (!member)
            return message.errorReply("You didn't specify a valid member!");

        if (mute && member.roles.cache.has(muterole)) {
            // If the user has the role, remove it
            await member.roles.remove(muterole);
            // Remove the mute from the DB
            await mutes.findOneAndDelete({
                guild: message.guild.id,
                mutedUser: member.id
            });
            // Send log message & confirmation message
            punishmentLog(message, member, mute.caseID, reason, "unmute");
            member.send(`🔈 You have been unmuted in **${message.guild.name}**`).catch(() => {});
            message.confirmationReply(`**${member.user.tag}** has been unmuted successfully!`);
        } else if (!mute && member.roles.cache.has(muterole)) {
            // If the user has the role, remove it
            await member.roles.remove(muterole);
            // Send confirmation msg
            message.confirmationReply(`**${member.user.tag}** was unmuted! *(They were not listed as muted in the database)*`);
        } else if (mute && !member.roles.cache.has(muterole)) {
            // Remove the mute from the DB
            await mutes.findOneAndDelete({
                guild: message.guild.id,
                mutedUser: member.id
            });
            // Send log message & confirmation message
            punishmentLog(message, member, mute.caseID, reason, "unmute");
            member.send(`🔈 You have been unmuted in **${message.guild.name}**`).catch(() => {});
            message.confirmationReply(`**${member.user.tag}** has been unmuted successfully! *(They did not seem to have the role)*`);
        } else if (!mute && !member.roles.cache.has(muterole)) {
            // If member doesn't have muted role AND is not in the DB, then remove the mute
            message.errorReply("That user is not muted!");
        }
    },

    run_interaction: async (bot, interaction) => {
        // 1. Get the member requested
        // 2. Get unmute reason
        // 3. Assign mute role to a const, cause easy
        // 4. Get mute data for the member
        const user = interaction.options.get("user"),
        reason = interaction.options.get("reason")?.value || "No reason specified",
        muterole = interaction.settings.roles.mute,
        mute = await mutes.findOne({ guild: interaction.guild.id, mutedUser: user.user.id }),
        action = await punishments.countDocuments({ guild: interaction.guild.id }) + 1 || 1;
        
        if (!user.member)
            return interaction.error("You did not specify a valid server member!");

        if (mute && user.member.roles.cache.has(muterole)) {
            // If the user has the role, remove it
            await user.member.roles.remove(muterole);
            // Remove the mute from the DB
            await mutes.findOneAndDelete({ guild: interaction.guild.id, mutedUser: user.user.id });

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: interaction.guild.id,
                type: "ummute",
                user: user.user.id,
                moderator: interaction.member.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Send log message & confirmation message
            punishmentLog(interaction, user.member, action, reason, "unmute");
            user.member.send(`🔈 You have been unmuted in **${interaction.guild.name}**`).catch(() => {});
            interaction.confirmation(`**${user.user.tag}** has been unmuted successfully! *(Case #${action})*`);
        } else if (!mute && user.member.roles.cache.has(muterole)) {
            // If the user has the role, remove it
            await user.member.roles.remove(muterole);
            // Send confirmation msg
            interaction.confirmation(`**${user.user.tag}** was unmuted! *(They were not listed as muted in the database)*`);
        } else if (mute && !user.member.roles.cache.has(muterole)) {
            // Remove the mute from the DB
            await mutes.findOneAndDelete({ guild: interaction.guild.id, mutedUser: user.user.id });

            // Create the punishment record in the DB
            await punishments.create({
                id: action,
                guild: interaction.guild.id,
                type: "unmute",
                user: user.user.id,
                moderator: interaction.member.id,
                actionTime: Date.now(),
                reason: reason
            });

            // Send log message & confirmation message
            punishmentLog(interaction, user.member, action, reason, "unmute");
            user.member.send(`🔈 You have been unmuted in **${interaction.guild.name}**`).catch(() => {});
            interaction.confirmation(`**${user.user.tag}** has been unmuted successfully! *(They did not seem to have the role) (Case #${action})*`);
        } else if (!mute && !user.member.roles.cache.has(muterole)) {
            // If member doesn't have muted role AND is not in the DB, then remove the mute
            interaction.error("That user is not muted!");
        }
    }
};