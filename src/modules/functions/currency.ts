import fetch, { Response } from 'node-fetch';
import logger from '../../logger';
import { CurrencyConversion } from '../../types';

export const convertCurrency = async (amt: number, fromCurrency: string, toCurrency: string): Promise<CurrencyConversion> =>
    new Promise((resolve, reject) => {
        fetch(`https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amt.toString()}`)
            .then((res: Response) => res.json())
            .then((json: CurrencyConversion) => resolve(json))
            .catch((err: Error) => {
                logger.error("Failed to fetch currency conversion:", err);
                reject(err);
            });
    });
