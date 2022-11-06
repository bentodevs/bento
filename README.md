<h1 align="center">
  <img alt="Bento Bot Logo" src="./.github/images/bento-logo.jpg" width="224px"/><br/>
  Bento Bot
</h1>
<p align="center">Bento is a multifunctional, modular Discord Bot. Build, manage and engage your community, whatever the size</p>

# Running Bento

## ⚡ Quick Start for Development

First, download and install Node.JS & NPM. Version 16 or higher of Node.JS is required.

Next install the required packages, using the `npm install` command.

Copy the `.env.example` file to `.env`, and fill in the required values.

<details>
  <summary>The API Token hosts can be found below:</summary>
  
  `DISCORD_TOKEN` - [Follow this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) <br/>
  `WEATHER_TOKEN` - https://www.weatherapi.com/ <br/>
  `STEAM_TOKEN` - https://steamcommunity.com/login/home/?goto=%2Fdev%2Fapikey <br/>
  `TRACKER_NETWORK_TOKEN` - https://tracker.gg/developers/docs/getting-started <br/>
  `BENTO_API_TOKEN` - You can ignore this for the time being. The Bento API is only used to fetch Lyrics <br/>
  `LASTFM_TOKEN` - https://www.last.fm/api/account/create <br/>
  `WEBPROXY_HOST` - You'll need to either setup, or purchase access to, a HTTP Webproxy <br/>

</details>

Finally, run the bot using the following commands:

```
npm run build
npm run start
```

## Running Bento for your server

> Bento updates are frequent, and to ensure you have the best experience, we'd recommend that you **do not** Self-Host Bento. You can add the hosted version [by clicking this link](https://discord.com/oauth2/authorize?client_id=686647951694758033&scope=bot&permissions=294071495923)

- Install Docker for your environment
- Copy the [docker-compose file](./docker-compose.yml.tmpl) to `docker-compose.yml` to your environment
- Fill in the environment varables
- Copy the `.env.example` file to `.env`, and fill in the required values.
<details>
  <summary>The API Token hosts can be found below:</summary>
  
  `DISCORD_TOKEN` - [Follow this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) <br/>
  `WEATHER_TOKEN` - https://www.weatherapi.com/ <br/>
  `STEAM_TOKEN` - https://steamcommunity.com/login/home/?goto=%2Fdev%2Fapikey <br/>
  `TRACKER_NETWORK_TOKEN` - https://tracker.gg/developers/docs/getting-started <br/>
  `BENTO_API_TOKEN` - You can ignore this for the time being. The Bento API is only used to fetch Lyrics <br/>
  `LASTFM_TOKEN` - https://www.last.fm/api/account/create <br/>
  `WEBPROXY_HOST` - You'll need to either setup, or purchase access to, a HTTP Webproxy <br/>

</details>

- Create a folder called `scripts`, and place the [Mongo Configuration Script](./scripts/init-mongo.js/tmpl) inside. Copy this to `init-mongo.js`, and create a password for the Bento user.

- Run the command `docker-compose up -d`

