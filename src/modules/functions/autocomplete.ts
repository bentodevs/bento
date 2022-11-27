import currencySymbols from "../../data/functionalData/currencySymbols";

export const findCurrency = (search: string): Array<{ name: string, value: string }> => {
    // Create an array from the first 15 items which match the focused value
    const currencyList = currencySymbols
        .filter((value) => value.name.toLowerCase().includes(search))
        .slice(0, 15);

    // Create the options map
    const optionsMap = currencyList.map((choice) => ({ name: choice.name, value: choice.value }));

    return optionsMap;
};
