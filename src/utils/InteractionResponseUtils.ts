import emojis from "../data/emotes";
import { InteractionResponseUtilsOptions } from "../types";

export class InteractionResponseUtils {
    /**
     *
     * @param interaction The interaction to reply to
     * @param content The content to send in the reply
     * @param ephemeral Whether this should be sent as an ephemeral response
     * @returns
     */
    static error(interaction: InteractionResponseUtilsOptions['interaction'], content: InteractionResponseUtilsOptions['content'], ephemeral: InteractionResponseUtilsOptions['ephemeral']): Promise<unknown> {
        return new Promise((resolve, reject) => {
            interaction.reply({ content: emojis.error + content, ephemeral: (ephemeral ?? false) })
                .then((int: unknown) => resolve(int))
                .catch((err) => reject(err));
        });
    }

    /**
     *
     * @param interaction The interaction to reply to
     * @param content The content to send in the reply
     * @param ephemeral Whether this should be sent as an ephemeral response
     * @returns
     */
    static confirmation(interaction: InteractionResponseUtilsOptions['interaction'], content: InteractionResponseUtilsOptions['content'], ephemeral: InteractionResponseUtilsOptions['ephemeral']): Promise<unknown> {
        return new Promise((resolve, reject) => {
            interaction.reply({ content: emojis.confirmation + content, ephemeral: (ephemeral ?? false) })
                .then((int: unknown) => resolve(int))
                .catch((err) => reject(err));
        });
    }
}
