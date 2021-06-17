# R2-D2 Public Instance
---

This bot is designed to be a public facing version of R2-D2. It does not include tickets or any other form of data designed to be used only in Amirion servers.

## Running the bot
### Requirements
- MongoDB
- Node.JS v14.0 or higher
- NPM

### Run Scripts
Script | Description
-------|------------
`npm run lint` | Runs eslint on the bot's files and returns a list of any non-conforming files
`npm run start` | Runs the bot with no Node.JS tracing present
`npm run tracer` | Runs the bot with error/warning tracing
## Adding the bot to a server
Link | Permissions | Scopes
-----|-------------|--------
[Link](https://discord.com/api/oauth2/authorize?client_id=854758155339038740&permissions=8&scope=bot%20applications.commands) | `ADMINISTRATOR` | `applications.commands`
[Link](https://discord.com/api/oauth2/authorize?client_id=854758155339038740&permissions=2097671415&scope=bot%20applications.commands) | `MANAGE_CHANNELS`, `MANAGE_ROLES`, `MANAGE_EMOJIS`, `VIEW_AUDIT_LOG`, `MANAGE_WEBHOOKS`, `MANAGE_SERVER`, `CREATE_INSTANT_INVITE`, `CHANGE_NICKNAME`, `MANAGE_NICKNAME`, `KICK_MEMBERS`, `BAN_MEMBERS`, `READ_MESSAGES`, `SEND_MESSAGES`, `EMBED_LINKS`, `ADD_REACTIONS`, `USE_EXTERNAL_EMOJIS`, `MENTION_EVERYONE`, `MANAGE_MESSAGES`, `READ_MESSAGE_HISTORY`, `VIEW_CHANNEL`, `MOVE_MEMBERS` | `applications.commands`

# Contributors
<table>
  <tr>
    <td align="center"><a href="https://jarno.gg/"><img src="https://avatars.githubusercontent.com/u/38568140?v=4" width="100px;" alt=""/><br /><sub><b>Jarno<b></sub></a><br /><a href="https://github.com/AmirionStudios/R2-D2-Public/commits?author=JarnoPwr" title="Code">💻</a> <a href="https://github.com/AmirionStudios/R2-D2-Public/commits?author=JarnoPwr" title="Documentation">📖</a> <a href="#projectManagement-Favna" title="Project Management">📆</a></td>
    <td align="center"><a href="https://behn.cc/"><img src="https://avatars.githubusercontent.com/u/7383025?v=4" width="100px;" alt=""/><br /><sub><b>Behn<b></sub></a><br /><a href="https://github.com/AmirionStudios/R2-D2-Public/commits?author=WaitroseDev" title="Code">💻</a> <a href="https://github.com/AmirionStudios/R2-D2-Public/commits?author=WaitroseDev" title="Documentation">📖</a> <a href="#projectManagement-Favna" title="Project Management">📆</a></td>
  </tr>
</table>