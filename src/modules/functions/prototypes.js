/* eslint-disable func-names */
/* eslint-disable no-extend-native */
module.exports = () => {
    String.prototype.toTitleCase = function () {
        let i; let j; let
            str;
        str = this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

        // Certain minor words should be left lowercase unless
        // they are the first or last words in the string
        const lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
            'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
        for (i = 0, j = lowers.length; i < j; i + 1) {
            str = str.replace(
                new RegExp(`\\s${lowers[i]}\\s`, 'g'),
                (txt) => txt.toLowerCase(),
            );
        }

        // Certain words such as initialisms or acronyms should be left uppercase
        const uppers = ['Id', 'Tv'];
        for (i = 0, j = uppers.length; i < j; i + 1) {
            str = str.replace(
                new RegExp(`\\b${uppers[i]}\\b`, 'g'),
                uppers[i].toUpperCase(),
            );
        }

        return str;
    };

    Number.prototype.pad = function (size) {
        let s = String(this);
        while (s.length < (size || 2)) {
            s = `0${s}`;
        }
        return s;
    };

    String.prototype.removeHTML = function () {
        // Replace HTML tags
        return this.replace(/<[^>]+>/g, '');
    };

    String.prototype.convertMarkdown = function () {
        // Replace anilist markdown with discord markdown
        return this.replace(/__/g, '**')
            .replace(/~!/g, '||')
            .replace(/!~/g, '||')
            .replace(/##/g, '');
    };

    String.prototype.removeUrbanFormatting = function () {
        // Remove urban dictionary formatting
        return this.replace(/\[/g, '')
            .replace(/]/g, '');
    };

    String.prototype.removeMinecraftCodes = function () {
        // Remove minecraft colour codes
        return this.replace(/\u00A7[0-9A-FK-OR]/ig, '');
    };

    String.prototype.reverseText = function () {
        // Reverse the string
        return this.split('').reverse().join('');
    };

    String.prototype.cleanEmotes = function () {
        return this.replace(/<a?:(\w+):(\d+)>/gi, ':$1:');
    };

    String.prototype.toBinary = function () {
        return this.split('').map((char) => char.charCodeAt(0).toString(2)).join(' ');
    };

    String.prototype.binToClear = function () {
        let binString = '';

        // eslint-disable-next-line array-callback-return
        this.split(' ').map((char) => {
            binString += String.fromCharCode(parseInt(char, 2));
        });

        return binString;
    };

    Array.prototype.shuffle = function () {
        for (let i = this.length - 1; i > 0; i - 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }

        return this;
    };
};
