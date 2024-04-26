export default class LocalizationManager {

    constructor(language, localizationFile) {
        this.language = language;
        this.localizationFile = localizationFile;
    }

    getWord(word) {

        let result = this.localizationFile[word][this.language];
        if (result === undefined) {
            return word;
        }
        return result;
    }
}