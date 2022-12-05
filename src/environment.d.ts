declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Discord Token
            DISCORD_TOKEN: string
            // API Keys
            WEATHER_TOKEN: string
            STEAM_TOKEN: string
            RIOT_TOKEN: string
            TRACKER_NETWORK_TOKEN: string
            OMDB_TOKEN: string
            LASTFM_TOKEN: string
            // HTTP Proxy
            WEBPROXY_HOST: string
            // MongoDB Connection String
            MONGODB_URI: string
            // Bento Bot API
            BENTO_API_TOKEN: string
            // Loki logging API
            LOKI_URL: string
            LOKI_AUTH: string
        }
    }
}

export { };
