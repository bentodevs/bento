import {
    Client, CommandInteraction,
} from 'discord.js';

export interface Command {
    info: {
        name: string,
        description: string,
        usage: string,
        examples: string[],
        category: category,
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
        opts: any[],
        defaultPermission: boolean,
        dmPermission: boolean
    },
    run(bot: Client, interaction: CommandInteraction): any,
}

type category = 'Developer' |
'Fun' |
'Games' |
'Information' |
'Miscellaneous' |
'Moderation' |
'Settings' |
'Utility' |
'Weebs';
