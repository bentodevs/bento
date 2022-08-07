declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string,
            WEATHER_TOKEN: string,
            STEAM_TOKEN: string,
            RIOT_TOKEN: string,
            TRACKER_NETWORK_TOKEN: string,
            OMDB_TOKEN: string,
            LASTFM_TOKEN: string,
            R2D2_TOKEN: string,
            WEBPROXY_HOST: string,
            MONGODB_USERNAME: string,
            MONGODB_PASSWORD: string,
            MONGODB_HOST: string,
            MONGODB_PORT: string,
            MONGODB_DATABASE: string,
        }
    }
}

export { };
