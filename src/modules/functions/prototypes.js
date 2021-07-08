module.exports = () => {
    String.prototype.toTitleCase = function () {
        let i, j, str;
        str = this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      
        // Certain minor words should be left lowercase unless 
        // they are the first or last words in the string
        const lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
            'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
        for (i = 0, j = lowers.length; i < j; i++)
            str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
                function (txt) {
                    return txt.toLowerCase();
                });
      
        // Certain words such as initialisms or acronyms should be left uppercase
        const uppers = ['Id', 'Tv'];
        for (i = 0, j = uppers.length; i < j; i++)
            str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
                uppers[i].toUpperCase());
      
        return str;
    };

    Number.prototype.pad = function (size) {
        let s = String(this);
        while (s.length < (size || 2)) {
            s = "0" + s;
        }
        return s;
    };

    String.prototype.removeHTML = function () {
        // Replace HTML tags
        return this.replace(/<[^>]+>/g, "");
    };

    String.prototype.convertMarkdown = function() {
        // Replace anilist markdown with discord markdown
        return this.replace(/__/g, "**")
            .replace(/~!/g, "||")
            .replace(/!~/g, "||")
            .replace(/##/g, "");
    };

    String.prototype.removeUrbanFormatting = function() {
        // Remove urban dictionary formatting
        return this.replace(/\[/g, "")
            .replace(/]/g, "");
    };

    String.prototype.removeMinecraftCodes = function() {
        // Remove minecraft colour codes
        return this.replace(/\u00A7[0-9A-FK-OR]/ig, "");
    };

    String.prototype.reverseText = function() {
        // Reverse the string
        return this.split("").reverse().join("");
    };
};