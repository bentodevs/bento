const config = {

    // General Settings
    general: {
        prefix: '.', // Default Bot Prefix
        version: '2021.2.0', // Current Version
        embedColor: '#ABCDEF', // Default Embed Color,
        devs: [
            '420325176379703298', // Jarno
            '648882989471891499', // Waitrose
        ],
        sentrydsn: '',
    },

    // Global logging
    logging: {
        errors: {
            guild: '686699491277013088', // Guild to log errors in
            channel: '813493670291439718', // Channel to log errors in
            url: 'https://discord.gg/j2RqEzxCCQ',
        },
        joinleave: {
            guild: '826250676631502878',
            channel: '859113556938326026',
        },
    },

    // Global Emojis
    emojis: {
        jarno: '<:jarno:851826791802339368>',
        waitrose: '<a:waitrose:829037825814822962>',
        error: '<:error:826561401689473074>',
        loading: '<a:loading:826897312298172426>',
        confirmation: '<:check:826896266490806352>',
        url: '<:url:826560037307809906>',
        djs: '<:djs:829033833022226502>',
        nodejs: '<:nodejs:829033820522676261>',
        online: '<:online:829324030623875072>',
        dnd: '<:dnd:829324044674662430>',
        poll: '<:questionmark:844574004404551700>',
        users: '<:users:846758590723522571>',
        chatting: '<:chatting:846758254054342696>',
        group: '<:group:846758640174104636>',
        level_up: '<:level_up:857966346369105920>',
        nitro: '<:nitro:859837477199806524>',
        bans: '<:BlobSaluteBan:852647544558452756>',
        unban: '<:unban:873653427199152169>',
        channel: '<:channel:843408284010545153>',
        pepe_ping: '<:PeepoPing:842359606697132073>',
        warning: '<a:warning:935206281172627457>',
    },
};

export default config;
// module.exports = config;
