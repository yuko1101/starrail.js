import { bindOptions } from "config_file.js";
import StarRail from "../../client/StarRail";
import TextAssets from "./TextAssets";
import { LanguageCode } from "../../client/CachedAssetsManager";

/** @typedef */
export interface DynamicData {
    paramList: number[];
}

const defaultDynamicData: DynamicData = {
    paramList: [],
};

/**
 * @en DynamicTextAssets
 * TextAssets which has placeholders in the text.
 */
class DynamicTextAssets extends TextAssets {
    /**  */
    readonly dynamicData: DynamicData;

    readonly _dynamicTest: string | null;

    /**
     * @param id
     * @param data
     * @param client
     */
    constructor(id: number, data: Partial<DynamicData>, client: StarRail) {
        super(id, client);

        this.dynamicData = bindOptions(defaultDynamicData as unknown as { [s: string]: unknown }, data) as unknown as DynamicData;

        this._dynamicTest = this.getNullableReplacedText();
    }

    /**
     * @param replaceWith
     * @param lang
     * @throws AssetsNotFoundError
     */
    getReplacedData(replaceWith: (keyof DynamicData)[] = [], lang?: LanguageCode): { text: string, usedParamIndices: number[] } {
        function isEnabled(key: keyof DynamicData) {
            return replaceWith.length === 0 || replaceWith.includes(key);
        }

        const usedParamIndices: number[] = [];

        let text = this.get(lang);
        if (isEnabled("paramList")) {
            text = text.replace(/<unbreak>#(\d+)\[(.+?)\](%?)<\/unbreak>/g, (_, paramIndexText, valueType, percent) => {
                const paramIndex = parseInt(paramIndexText) - 1;
                const isPercent = percent === "%";

                const value = this.dynamicData.paramList[paramIndex] * (isPercent ? 100 : 1);
                usedParamIndices.push(paramIndex);

                const fix: number | null =
                    valueType === "i" ? 0
                        : /^f\d+$/.test(valueType) ? Number(valueType.replace("f", ""))
                            : null;
                if (fix === null) {
                    // TODO: remove this
                    console.error(`Unknown valueType ${valueType} in DynamicTextAssets.`);
                    throw new Error(`Unknown valueType ${valueType} in DynamicTextAssets.`);
                }
                const fixedValue = value.toFixed(fix);

                return fixedValue + percent;
            });
        }

        return { text, usedParamIndices };
    }

    /**
     * @param replaceWith
     * @param lang
     * @returns null instead of throwing AssetsNotFoundError.
     */
    getNullableReplacedData(replaceWith: (keyof DynamicData)[] = [], lang?: LanguageCode): { text: string, usedParamIndices: number[] } | null {
        try {
            return this.getReplacedData(replaceWith, lang);
        } catch (e) {
            return null;
        }
    }

    /**
     * @param replaceWith
     * @param lang
     * @throws AssetsNotFoundError
     */
    getReplacedText(replaceWith: (keyof DynamicData)[] = [], lang?: LanguageCode): string {
        return this.getReplacedData(replaceWith, lang).text;
    }

    /**
     * @param replaceWith
     * @param lang
     * @returns null instead of throwing AssetsNotFoundError.
     */
    getNullableReplacedText(replaceWith: (keyof DynamicData)[] = [], lang?: LanguageCode): string | null {
        try {
            return this.getReplacedText(replaceWith, lang);
        } catch (e) {
            return null;
        }
    }
}

export default DynamicTextAssets;