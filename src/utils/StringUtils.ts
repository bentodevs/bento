export class StringUtils {
    static toTitleCase(text: string) {
        let i: number;
        let j: number;
        let str: string;
        // eslint-disable-next-line prefer-arrow-callback
        str = text.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });

        // Certain minor words should be left lowercase unless
        // they are the first or last words in the string
        const lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
            'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
        for (i = 0, j = lowers.length; i < j; i += 1) {
            str = str.replace(
                new RegExp(`\\s${lowers[i]}\\s`, 'g'),
                // eslint-disable-next-line prefer-arrow-callback
                function (txt) {
                    return txt.toLowerCase();
                },
            );
        }

        // Certain words such as initialisms or acronyms should be left uppercase
        const uppers = ['Id', 'Tv'];
        for (i = 0, j = uppers.length; i < j; i += 1) {
            str = str.replace(
                new RegExp(`\\b${uppers[i]}\\b`, 'g'),
                uppers[i].toUpperCase(),
            );
        }
        return str;
    }

    static removeHtml(text: string) {
        return text.replace(/<[^>]+>/g, '');
    }

    static convertMarkdown(text: string) {
        return text.replace(/\[/g, '')
            .replace(/]/g, '');
    }

    static removeMinecraftCodes(text: string) {
        return text.replace(/\u00A7[0-9A-FK-OR]/ig, '');
    }

    static reverseText(text: string) {
        return text.split('').reverse().join('');
    }

    static cleanEmotes(text: string) {
        return text.replace(/<a?:(\w+):(\d+)>/gi, ':$1:');
    }

    static removeUrbanFormatting(text: string) {
        return text.replace(/\[/g, '').replace(/]/g, '');
    }

    static stringToBinary(text: string) {
        return text.split('').map((char) => char.charCodeAt(0).toString(2)).join(' ');
    }

    static binaryToString(text: string) {
        let converted = '';
        // eslint-disable-next-line array-callback-return
        text.split(' ').map((char) => {
            converted += String.fromCharCode(parseInt(char, 10));
        });

        return converted;
    }
}
