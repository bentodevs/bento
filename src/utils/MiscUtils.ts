import { DISCORD_EPOCH } from '../data/constants.js';

export default class MiscUtils {
    static snowflakeToTimestamp(id) {
        const idInt = BigInt(id);
        // eslint-disable-next-line no-bitwise
        return Number(idInt >> BigInt(22)) + DISCORD_EPOCH;
    }
}
