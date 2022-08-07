import { GatewayIntentBits } from 'discord.js';

/* * Bot Options * */
export const DEFAULT_LANGUAGE = 'en_US';
export const DEBUG_ENABLED = false;
export const OWNERS = ['648882989471891499'];
export const DEV_SERVER = ['686699491277013088'];

/* * Bot Constants * */
export const VERSION = '1.0.0';

export const DOMAIN = 'bento-bot.com';
export const WEBSITE = `https://${DOMAIN}`;
export const DASHBOARD = `https://dashboard.${DOMAIN}`;

export const SUPPORT_SERVER = 'https://discord.gg/DwxCdXp276';
export const DEFAULT_COLOR = '#a4c5ea';
export const PRESENCE_TEXT = '/help | bento-bot.com';

/* * Shard Options * */
export const SHARDED = false;
export const SHARD_COUNT = 1;
export const SHARD_SPAWN_COMMAND = 'node';
export const SHARD_SPAWN_FILE = './bot.js';

export const SHARD_MESSAGE_TIMEOUT = 0;

export const RESPAWN_DEAD_SHARDS = true;
export const EXIT_CODE_RESTART = 1;
export const EXIT_CODE_NO_RESTART = 69;

/* * Connection Info * */
export const INTENTS = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
];

/* * Discord Constants * */
export const DISCORD_EPOCH = 1420070400000;
export const CDN_BASE = 'https://cdn.discordapp.com/';
export const OPS_JOINLEAVE_ID = '1004877046985523262';
export const OPS_JOINLEAVE_SECRET = 'OoHZR3otThGKzbKnT6y7gOdWAxYqk60RO4W4-Y0oW3doi8XJ34hKfQTg-fYgdAE0Hmfs';

/* * Misc Constants * */
export const ID_REGEX = /\b\d{17,19}\b/;
export const ID_REGEX_EXACT = /^\d{17,19}$/;

export const INVITE_LINK_PREFIX = 'https://discord.gg/';
export const INVITE_CODE_REGEX = /^[a-z0-9-]{2,32}$/i;
export const INVITE_REGEX = /discord(?:\.gg(?:\/invite)?|(?:app)?\.com\/invite)\/([a-z0-9-]{2,32})/i;
export const INVITE_REGEX_EXACT = /^(?:https?:\/\/)?discord(?:\.gg(?:\/invite)?|(?:app)?\.com\/invite)\/([a-z0-9-]{2,32})$/i;
export const INVITE_REGEX_GLOBAL = /discord(?:\.gg(?:\/invite)?|(?:app)?\.com\/invite)\/([a-z0-9-]{2,32})/gi;

export const LEAGUE_DATA_DRAGON_URL = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json';
export const SENTRY_DSN = 'https://e8f11fffff2f44c7a175b8f3a5dc0fc5@o1343172.ingest.sentry.io/6617609';
