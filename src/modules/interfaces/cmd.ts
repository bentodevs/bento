import {
    Client, CommandInteraction,
} from 'discord.js';

type Category = 'Developer' |
'Fun' |
'Games' |
'Information' |
'Miscellaneous' |
'Moderation' |
'Settings' |
'Utility' |
'Weebs';

export interface Command {
    info: {
        name: string,
        description: string,
        usage: string,
        examples: string[],
        category: Category,
        information?: string,
        selfPerms: bigint[],
    },
    opts: {
        guildOnly: boolean,
        devOnly: boolean,
        premium: boolean,
        disabled: boolean,
    },
    slash: {
        types: {
            chat: boolean,
            user: boolean,
            message: boolean,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        opts: any[],
        defaultPermission: boolean,
        dmPermission: boolean
    },
    // eslint-disable-next-line no-unused-vars , @typescript-eslint/no-explicit-any
    run(bot: Client, interaction: CommandInteraction): any,
}
