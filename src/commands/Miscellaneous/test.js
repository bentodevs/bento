module.exports = {
    info: {
        name: "test",
        aliases: [
        ],
        usage: "",
        examples: [],
        description: "",
        category: "Miscellaneous",
        info: null,
        options: []
    },
    perms: {
        permission: ["@everyone"],
        type: "discord",
        self: ["EMBED_LINKS"]
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        noArgsHelp: false,
        disabled: false
    },
    slash: {
        enabled: false,
        opts: []
    },

    run: async (bot, message, args) => {

        const fetch = require('node-fetch');
        const HttpsProxyAgent = require('https-proxy-agent');


        (async () => {
            const proxyAgent = new HttpsProxyAgent("https://route.amirion.dev");
            const response = await fetch('https://httpbin.org/ip?json', { agent: proxyAgent });
            const body = await response.json();
            
            message.reply(`\`\`\`json\n${body}\`\`\``);
        })().catch(err => {
            message.errorReply(`Something went wrong: \`${err.message}\``);
        });

    },

    run_interaction: async (bot, interaction) => {

    }
};