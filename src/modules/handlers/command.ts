// Import Dependencies
import { ApplicationCommandType, Client } from 'discord.js';
import { readdirSync } from 'fs';
// eslint-disable-next-line import/no-cycle
import { commands } from '../../bot';
import logger from '../../logger';

/**
 * Start the command handler and load all the commands.
 *
 * @returns {Promise<void>} The amount of commands loaded
 */
export const init = (): Promise<void> => new Promise<void>((resolve) => {
    // Get the category directories
    const categories = readdirSync('./commands');
    // Loop through the categories
    for (const category of categories) {
        // Get all the commands
        const cmds = readdirSync(`./commands/${category}`).filter((file) => file.endsWith('.js'));

        // Loop through the commands
        for (const file of cmds) {
            // Import the command
            import(`../../commands/${category}/${file}`).then((cmd) => {
                // Clone the command object to a new object
                const obj = Object.create(cmd.default);

                // Set the command path
                obj.path = `../../commands/${category}/${file}`;
                if (!cmd.default.opts.disabled) {
                    // Register the command
                    commands.set(cmd.default.info.name, obj);
                }
            }).catch((err) => {
                logger.error(`Failed to load ${file}`);
                logger.error(err.stack);
            });
        }
    }

    // Resolve the amount of commands that were added
    resolve();
});

/**
 * Register all global commands
 *
 * @param {Object} bot The client which is used to transact between this app & Discord
 *
 * @returns {Promise.<Boolean>} Returns true if the commands registered successfully
 */
export const registerGlobal = (bot: Client): Promise<boolean> => new Promise((resolve, reject) => {
    const arr: any[] = [];
    const cmds = Array.from(commands.values());// .filter(c => !c.opts.guildOnly);

    for (const data of cmds) {
        if (data.slash?.types?.chat) {
            arr.push({
                name: data.info.name,
                description: data.info.description,
                type: ApplicationCommandType.ChatInput,
                options: data.slash?.opts ?? [],
                defaultPermission: data.slash?.defaultPermission ?? false,
                dmPermission: data.slash?.dmPermission ?? false,
            });
        }

        if (data.slash?.types?.user) {
            arr.push({
                name: data.info.name,
                type: ApplicationCommandType.User,
            });
        }

        if (data.slash?.types?.message) {
            arr.push({
                name: data.info.name,
                type: ApplicationCommandType.Message,
            });
        }
    }

    // Set the guild commands
    bot.application?.commands.set(arr).then(() => {
        resolve(true);
    }).catch((err: any) => {
        reject(err);
    });
});
