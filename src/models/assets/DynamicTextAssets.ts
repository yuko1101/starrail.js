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
    getReplacedText(replaceWith: (keyof DynamicData)[] = [], lang?: LanguageCode): string {
        const data = replaceWith.length === 0 ? this.dynamicData : Object.fromEntries(Object.entries(this.dynamicData).filter(([key]) => replaceWith.includes(key as keyof DynamicData))) as Partial<DynamicData>;
        let text = this.get(lang);

        const paramList = data.paramList;
        if (paramList) {
            text = text.replace(/<unbreak>#(\d+)\[(.+?)\](%?)<\/unbreak>/g, (_, paramIndexText, valueType, percent) => {
                const paramIndex = parseInt(paramIndexText) - 1;
                const isPercent = percent === "%";

                const value = paramList[paramIndex] * (isPercent ? 100 : 1);

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

        return text;
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