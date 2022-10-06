import { CDN_BASE } from '../data/constants.js';

function formatAndSize(format, size) {
    return `.${format}${size ? `?size=${size}` : ''}`;
}

function fixAnimatedFormat(format, hash) {
    let fmt;

    if (format !== 'gif' && hash.startsWith('a_')) {
        fmt = 'gif';
    } else if (format === 'gif' && !hash.startsWith('a_')) {
        fmt = 'png';
    } else {
        fmt = format;
    }

    return fmt;
}

export default class CDNUtils {
    static emojiUrl(emojiId, animated, size = 256, format = 'png') {
        const fmt = fixAnimatedFormat(format, animated ? 'a_' : '');
        return `${CDN_BASE}emojis/${emojiId}${formatAndSize(fmt, size)}`;
    }
}
