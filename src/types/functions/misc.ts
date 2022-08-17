export type DadJoke = {
    id: string,
    joke: string,
    status: number
};

export type DiscordStatus = {
    page: {
        id: string,
        name: string,
        url: string,
        time_zone: string,
        updated_at: string
    },
    components: DiscordStatusComponent[],
    incidents: DiscordStatusIncidentElement[],
    scheduled_maintenances: DiscordStatusMaintenanceElement[],
    status: {
        indicator: string,
        description: string
    }
}

export type DiscordStatusComponent = {
    id: string
    name: string
    status: string
    created_at: string
    updated_at: string
    position: number
    description: string | null
    showcase: boolean
    start_date: string | null
    group_id: string | null
    page_id: string
    group: boolean
    only_show_if_degraded: boolean
}

type DiscordStatusIncidentElement = {
    created_at: string,
    id: string,
    impact: string,
    incident_updates: DiscordStatusUpdateElement[],
    monitoring_at: string | null
    name: string
    page_id: string
    resolved_at: string | null
    shortlink: string | null
    status: string
    updated_at: string
}

type DiscordStatusMaintenanceElement = {
    created_at: string,
    id: string,
    impact: string,
    incident_updates: DiscordStatusUpdateElement[],
    monitoring_at: string | null
    name: string
    page_id: string
    scheduled_for: string
    scheduled_until: string
    shortlink: string | null
    status: string
    updated_at: string
}

type DiscordStatusUpdateElement = {
    body: string
    created_at: string
    display_at: string
    id: string
    incident_id: string
    status: string
    updated_at: string
}

export type UrbanDictionaryDefinitionElement = {
    definition: string
    permalink: string
    thumbs_up: number
    sound_urls: unknown[]
    author: string
    word: string
    defid: number
    current_vote: string
    written_on: string
    example: string
    thumbs_down: number
};

export type UrbanDictionary = {
    list: Array<UrbanDictionaryDefinitionElement>
    error?: string
};

export interface Weather {
    location: WeatherLocation
    current: CurrentWeather
}

export interface CurrentWeather {
    last_updated_epoch: number
    last_updated: string
    temp_c: number
    temp_f: number
    is_day: number
    condition: WeatherCondition
    wind_mph: number
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    pressure_in: number
    precip_mm: number
    precip_in: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    vis_miles: number
    uv: number
    gust_mph: number
    gust_kph: number
}

export interface WeatherCondition {
    text: string
    icon: string
    code: number
}

export interface WeatherLocation {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    tz_id: string
    localtime_epoch: number
    localtime: string
}
