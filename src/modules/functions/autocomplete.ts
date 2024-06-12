import { commands } from "../../bot";
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

export const findCommand = (search: string): Array<{ name: string, value: string }> => {
    const commandList = Array.from(commands
        .filter((catFilter) => catFilter.info.category.toLowerCase() != "Dev")
        .filter((value) => value.info.name.toLowerCase().includes(search)).values())
        .slice(0, 15);

    const optionsMap = commandList.map((choice) => ({ name: choice.info.name, value: choice.info.name }));

    return optionsMap;
};

export const findCategory = (search: string): Array<{ name: string, value: string }> => {
    const categoryList = [{
        name: "Fun",
        value: "fun"
    }, {
        name: "Information",
        value: "information"
    }, {
        name: "Miscellaneous",
        value: "miscellaneous"
    }, {
        name: "Settings",
        value: "settings"
    }, {
        name: "Weebs",
        value: "weebs"
    }];

    const optionsMap = categoryList
        .filter((value) => value.value.includes(search.toLowerCase()))
        .slice(0, 15);

    return optionsMap;
};
