declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string
            LAUNCHDARKLY_TOKEN: string
            WEATHER_TOKEN: string
            STEAM_TOKEN: string
            RIOT_TOKEN: string
            TRACKER_NETWORK_TOKEN: string
            OMDB_TOKEN: string
            LASTFM_TOKEN: string
            BENTO_API_TOKEN: string
            WEBPROXY_HOST: string
            MONGODB_URI: string
        }
    }
}

export { };
