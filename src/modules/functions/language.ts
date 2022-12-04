export const localizeString = (string: string, language: string): string => {
    // Get the language file for the specified language code
    const languageFile = getLanguageFile(language);

    // If the language file is not found, throw an error
    if (!languageFile) {
        throw new Error(`Language file for language code ${language} not found.`);
    }

    // Get the localized string from the language file using the specified key
    const localizedString = languageFile[string];

    // If the localized string is not found, throw an error
    if (!localizedString) {
        throw new Error(`Localized string for key ${string} not found in language file for language code ${language}.`);
    }

    return localizedString;
};

const getLanguageFile = (language: string) => {
    // Fetch the language file from the language data directory
    const langFile = import(`../../data/languageData/${language}.json`);

    return langFile;
};
