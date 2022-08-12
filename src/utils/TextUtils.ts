function getRegex(chars, exact, timestamp = false) {
    return new RegExp(`${exact ? '^' : ''}<${chars}(\\d{${timestamp ? '1,16' : '17,19'}})${timestamp ? '(:[tTdDfFR])?' : ''}>${exact ? '$' : ''}`);
}

export const USER_MENTION_REGEX = getRegex('@!?', false);
export const USER_MENTION_REGEX_EXACT = getRegex('@!?', true);

export const CHANNEL_MENTION_REGEX = getRegex('#', false);
export const CHANNEL_MENTION_REGEX_EXACT = getRegex('#', true);

export const ROLE_MENTION_REGEX = getRegex('@&', false);
export const ROLE_MENTION_REGEX_EXACT = getRegex('@&', true);

export const EMOJI_REGEX = getRegex('(a?):([a-z0-9]{2,32}):', false);
export const EMOJI_REGEX_EXACT = getRegex('(a?):([a-z0-9]{2,32}):', true);

export const TIMESTAMP_REGEX = getRegex('t:', false, true);
export const TIMESTAMP_REGEX_EXACT = getRegex('t:', true, true);

export const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

export class EmojiUtils {
    static extractEmoji(text: string, exact = true) {
        const regex = exact ? EMOJI_REGEX_EXACT : EMOJI_REGEX;
        const matches = text.match(regex);

        return matches ? {
            name: matches[2],
            id: matches[3],
            animated: !!matches[1],
        } : null;
    }

    static parseEmoji(emoji, addZeroWidth = false) {
        return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}${addZeroWidth ? '\u200B' : ''}>`;
    }

    static fromCodePoint(codepoint) {
        let code = typeof codepoint === 'string' ? parseInt(codepoint, 16) : codepoint;

        if (code < 0x10000) {
            return String.fromCharCode(code);
        }

        code -= 0x10000;
        return String.fromCharCode(
            // eslint-disable-next-line no-bitwise
            0xD800 + (code >> 10),
            // eslint-disable-next-line no-bitwise
            0xDC00 + (code & 0x3FF),
        );
    }
}
