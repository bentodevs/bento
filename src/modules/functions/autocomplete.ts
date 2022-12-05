import currencySymbols from "../../data/functionalData/currencySymbols";
import languages from "../../data/functionalData/languages";

export const findCurrency = (search: string): Array<{ name: string, value: string }> => {
    // Create an array from the first 15 items which match the focused value
    const currencyList = currencySymbols
        .filter((value) => value.name.toLowerCase().includes(search))
        .slice(0, 15);

    // Create the options map
    const optionsMap = currencyList.map((choice) => ({ name: choice.name, value: choice.value }));

    return optionsMap;
};

export const findLanguage = (search: string): Array<{ name: string, value: string }> => {
    // Create an array from the first 15 items which match the focused value
    const languageList = languages
        .filter((value) => value.display.toLowerCase().includes(search))
        .slice(0, 15);

    // Create the options map
    const optionsMap = languageList.map((choice) => ({ name: choice.display, value: choice.code }));

    return optionsMap;
};
