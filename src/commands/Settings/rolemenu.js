import { MessageEmbed } from 'discord.js';
import reactroles from '../../database/models/reactroles.js';
import { getChannel, getRole, getEmoji } from '../../modules/functions/getters.js';

export default {
    info: {
        name: 'rolemenu',
        aliases: [
            'rmenu',
            'reactmenu',
        ],
        usage: 'rolemenu [channel] [description || ] <emoji> <role> | ...',
        examples: [
            'reactmenu #roles Get a role by reacting || 📘 Blue | 🍏 Green',
            'reactmenu #roles 📘 Blue | 🍏 Green',
        ],
        description: 'Create, view or remove react menus.',
        category: 'Settings',
        info: null,
        options: [],
    },
    perms: {
        permission: 'ADMINISTRATOR',
        type: 'discord',
        self: ['EMBED_LINKS'],
    },
    opts: {
        guildOnly: true,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false,
    },
    slash: {
        enabled: false,
        opts: [],
    },

    run: async (bot, message, args) => {
        if (!args[0]) {
            // Grab all the react role data for this guild
            const reactRoles = await reactroles.find({ guild: message.guild.id });

            // If no data was found return an error
            if (!reactRoles.length) return message.errorReply("There aren't any reaction menus setup for this guild!");

            // Define the msg and num
            let msg = '';
            let num = 0;

            // Loop through the react roles data
            for (const data of reactRoles) {
                // Grab the channel, message and the roles
                const reactChannel = message.guild.channels.cache.get(data.channel);
                const reactMsg = await reactChannel.messages.fetch(data.message).catch(() => {});
                const { roles } = data;

                if (!reactMsg) {
                    await reactroles.findOneAndDelete({ guild: data.guild, message: data.message });
                    // eslint-disable-next-line no-continue
                    continue;
                }

                // Increase the number by 1
                num += 1;

                // If the message was found then add it to the msg
                if (reactMsg) msg += `**${num}.** Message ID: [${reactMsg.id}](${reactMsg.url}) | ${roles.length} role${roles.length > 1 ? 's' : ''} | ${reactChannel}\n`;
            }

            // If the message is empty return an error
            if (!msg) return message.errorReply("There aren't any reaction menus setup for this guild!");

            const embed = new MessageEmbed()
                .setAuthor({ name: `Reaction Menus for ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true, format: 'png' }) })
                .setColor(message.member.displayHexColor)
                .setDescription(msg);

            // Send the message
            message.channel.send({ embeds: [embed] });
        } else if (args[0] === 'remove') {
            // If the user didn't specify a message ID return an error
            if (!args[1]) return message.errorReply('You need to specify a message ID to remove!');

            // Grab the react menu
            const reactMenu = await reactroles.findOne({ guild: message.guild.id, message: args[1] });

            // If no menu was found return an error
            if (!reactMenu) return message.errorReply("You didn't specify a message ID which is being used for a react menu!");

            // Delete the menu
            await reactroles.findOneAndDelete({ guild: message.guild.id, message: args[1] });

            // Send a confirmation
            message.confirmationReply('Successfully removed that react menu from the database!');
        } else {
            // 1. Grab the first mentioned channel
            // 2. Define the options
            // 3. Get the description
            // 4. Get the options
            // 5. Define the array
            const channel = await getChannel(message, args[0]);
            const opts = args.slice(1).join(' ').split('||');
            const description = args.join(' ').includes('||') ? opts[0] : null;
            const options = opts[1]?.split('|') ?? args.slice(1).join(' ').split('|');
            const array = [];

            // Define the embed description
            let desc = description ? `${description}\n` : '';

            // If no valid channel was given return an error
            if (!channel) return message.errorReply("You didn't specify a valid channel! *(You must mention a channel!)*");

            // Check the bot has permissions to send messages in the channel
            if (!channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')
                || !channel.permissionsFor(message.guild.me).has('EMBED_LINKS')
                || !channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) return message.errorReply('I don\'t have permission to send messages in that channel! *(I require `Send messages`, `Embed links` and `Add reactions`!)*');

            // If no options were specified return an error
            if (!options) return message.errorReply("You didn't specify any roles/emojis!");

            // Loop through the options
            for (const data of options) {
                // 1. Split the options into an array
                // 2. Get the emoji
                // 3. Get the role
                const i = data.trim().split(/ +/g);
                const emote = getEmoji(message.guild, i[0]);
                const role = await getRole(message, i.slice(1).join(' '));

                // If no emote was found return an error
                if (!emote) return message.errorReply("You didn't specify a valid emoji! *You must specify a emoji from this Discord or a default Discord emoji.*");
                // If no role was found return an error
                if (!role) return message.errorReply("You didn't specify a valid role!");
                // If the role is higher than the bots highest role send an error
                if (message.guild.me.roles.highest.position <= role.position) { return message.errorReply('One of the roles you specified is higher than or equal to my highest role!'); }
                // If the role is higher than the users highest role send an error
                if (message.member.roles.highest.position <= role.position) return message.errorReply('One of the roles you specified is higher than or equal to your highest role!');

                // Push the emoji and role into the array
                array.push({
                    emoji: emote.emoji?.id ? emote.emoji.id : emote.emoji,
                    role: role.id,
                });

                // Add the emoji and role to the description
                desc += `\nReact with ${emote.emoji} to toggle the ${role} role!`;
            }

            // Create the embed
            const embed = new MessageEmbed()
                .setColor('#ABCDEF')
                .setTitle('Reaction Roles')
                .setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
                .setDescription(desc);

            // Send the embed
            const msg = await channel.send({ embeds: [embed] });

            // Add the reactions to the embed
            for (const i of array) {
                msg.react(i.emoji);
            }

            // Send a confirmation message
            message.confirmationReply('Successfully setup the reaction menu!');

            // Set create the database data
            await reactroles.create({
                guild: message.guild.id,
                message: msg.id,
                channel: channel.id,
                roles: array,
            });
        }
    },
};
