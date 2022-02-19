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
        sentrydsn: 'https://465b1d5d13e94c38b88ea251a4048b12@sentry.behn.cc/4',
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
        // Bot Developer avatars
        jarno: '<:jarno:851826791802339368>',
        waitrose: '<a:waitrose:829037825814822962>',
        // Standard message emojis
        error: '<:error:826561401689473074>',
        loading: '<a:loading:826897312298172426>',
        confirmation: '<:check:826896266490806352>',
        // Tooling emojis
        djs: '<:djs:829033833022226502>',
        nodejs: '<:nodejs:829033820522676261>',
        // User status emojis
        online: '<:online:829324030623875072>',
        dnd: '<:dnd:829324044674662430>',
        idle: '<:idle:837363975939031101>',
        offline: '<:offline:837364006783418389>',
        // User rich presence emojis
        spotify: '<:spotify:837364960069812335>',
        game: '🎮',
        discord: '<:discord:837365293968785409>',
        twitch: '<:twitch:837365045985804349>',
        player: '<:Webplayer:837365434763706448>',
        trophy: '🏆',
        // Punishment emojis
        bans: '<:BlobSaluteBan:852647544558452756>',
        unban: '<:unban:873653427199152169>',
        warning: '<a:warning:935206281172627457>',
        // Other emojis
        url: '<:url:826560037307809906>',
        poll: '<:questionmark:844574004404551700>',
        users: '<:users:846758590723522571>',
        chatting: '<:chatting:846758254054342696>',
        group: '<:group:846758640174104636>',
        level_up: '<:level_up:857966346369105920>',
        nitro: '<:nitro:859837477199806524>',
        channel: '<:channel:843408284010545153>',
        pepe_ping: '<:PeepoPing:842359606697132073>',
    },
};

export default config;
// module.exports = config;
