export interface CurrencyConversion {
    success: boolean
    info: {
        rate: number
    }
    historical: boolean
    date: string
    result: number
}
