import { request } from 'undici';
import logger from '../../logger';
import { CurrencyConversion } from '../../types';

export const convertCurrency = async (amt: number, fromCurrency: string, toCurrency: string): Promise<CurrencyConversion> =>
    new Promise((resolve, reject) => {
        request(`https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amt.toString()}`, {
            headers: {
                'accept': 'application/json',
                'user-agent': 'BentoBot (https://github.com/BentoDevs/bento)',
            }
        })
            .then((res) => res.body.json())
            .then((json: CurrencyConversion) => resolve(json))
            .catch((err: Error) => {
                logger.error("Failed to fetch currency conversion:", err);
                reject(err);
            });
    });
