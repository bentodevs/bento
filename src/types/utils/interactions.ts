import { ButtonInteraction, CommandInteraction } from "discord.js";

export type InteractionResponseUtilsOptions = {
    interaction: CommandInteraction | ButtonInteraction,
    ephemeral?: boolean,
    content: string
};
