import { LanguageCode } from "../../client/CachedAssetsManager";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";

/**
 * @en TextAssets
 */
class TextAssets {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    // readonly _test: string | null;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;

        this.client = client;

        // this._test = this.getNullable();
    }

    /**
     * @param lang
     * @throws {AssetsNotFoundError}
     */
    get(lang?: LanguageCode): string {
        lang ??= this.client.options.defaultLanguage;
        const text = this.client.cachedAssetsManager.getLanguageData(lang)[this.id];
        if (!text) throw new AssetsNotFoundError("Text Assets", this.id);
        return text;
    }

    /**
     * @returns null instead of throwing AssetsNotFoundError.
     */
    getNullable(lang?: LanguageCode): string | null {
        try {
            return this.get(lang);
        } catch (e) {
            return null;
        }
    }

    /**
     * @returns whether the text is formatted or not.
     */
    isFormatted(lang?: LanguageCode): boolean {
        const text = this.getNullable(lang);
        return isTextFormatted(text);
    }

    getAsFormattedText(lang?: LanguageCode): FormattedText {
        const text = this.get(lang);
        return new FormattedText(text);
    }

    /**
     * @returns null instead of throwing AssetsNotFoundError.
     */
    getAsNullableFormattedText(lang?: LanguageCode): FormattedText | null {
        try {
            return this.getAsFormattedText(lang);
        } catch (e) {
            return null;
        }
    }

    toString(): string {
        return this.getNullable() ?? `Unknown TextAssets(${this.id})`;
    }
}

export default TextAssets;

function isTextFormatted(text: string | null) {
    if (text === null) return false;
    return /<.+>/.test(text);
}

class FormattedText {
    readonly text: string;

    constructor(text: string) {
        this.text = text;
    }

    /**
     * Make colors and other formatting work in HTML.
     */
    replaceHTML(): FormattedText {
        const replaced = this.text
            .replace(/<color=([^>]+)>/g, "<span style=\"color:$1\">")
            .replace(/<\/color>/g, "</span>")

            .replace(/\r\n|\n|\\n|\r/gm, "<br>");

        return new FormattedText(replaced);
    }
}