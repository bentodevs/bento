import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../modules/interfaces/cmd';
import { convertCurrency } from '../../modules/functions/currency';
import currencySymbols from '../../data/functionalData/currencySymbols';
import { InteractionResponseUtils } from '../../utils/InteractionResponseUtils';
import { DEFAULT_COLOR } from '../../data/constants';

const command: Command = {
    info: {
        name: 'exchange',
        usage: '',
        examples: [],
        description: 'Convert a value from one currency to another.',
        category: 'Miscellaneous',
        selfPerms: [],
    },
    opts: {
        guildOnly: false,
        devOnly: false,
        premium: false,
        disabled: false,
    },
    slash: {
        types: {
            chat: true,
            message: false,
            user: false
        },
        opts: [{
            name: "amount",
            description: "The value you wish to convert.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }, {
            name: "from",
            description: "The currency you wish to convert the value from.",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }, {
            name: "to",
            description: "The currency you wish to convert the value to.",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }],
        dmPermission: false,
        defaultPermission: true,
    },

    run: async (bot, interaction: ChatInputCommandInteraction) => {
        const { options } = interaction;
        await interaction.deferReply();

        const amount = options.getNumber('amount', true);
        const fromCurrency = options.getString('from', true);
        const toCurrency = options.getString('to', true);

        const fromCurrencyName = currencySymbols.find((symbol) => symbol.value === fromCurrency);
        const toCurrencyName = currencySymbols.find((symbol) => symbol.value === toCurrency);

        convertCurrency(amount, fromCurrency, toCurrency)
            .then((result) => {
                const embed = new EmbedBuilder()
                    .setTitle('Currency Exchange Rate')
                    .setColor(DEFAULT_COLOR)
                    .setDescription(`${amount} **${fromCurrencyName?.name}** (\`${fromCurrency}\`) is ${result.result} **${toCurrencyName?.name}** (\`${toCurrency}\`)`)
                    .setFooter({ text: `Current exchange rate: 1 → ${result.info.rate}` })
                    .setTimestamp();

                interaction.followUp({ embeds: [embed] });
            })
            .catch((err) => {
                InteractionResponseUtils.error(interaction, `Oops! Something went wrong: ${err.message}`, true);
            });
    },
};

export default command;
