import { Snowflake } from 'discord.js';
import * as ld from 'launchdarkly-node-server-sdk';
import logger from './logger';

export const LDClient = ld.init('sdk-d706782b-be10-4da5-a7c4-271f04551297', {
    logger: logger
});

export const buildUser = (guildId: Snowflake, ownerId: Snowflake, executorId: Snowflake) => {
    return {
        key: guildId,
        custom: {
            guildOwnerId: ownerId,
            guildOwner: ownerId === executorId,
            executorId,
        }
    };
};
