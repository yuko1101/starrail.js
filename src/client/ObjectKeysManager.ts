import { JsonReader } from "config_file.js";
import { CachedAssetsManager, excelJsonOptions } from "./CachedAssetsManager";

export class ObjectKeysManager {
    /** Map key name where the value is StatPropertyType in property lists of set bonuses in RelicSetSkillConfig.json */
    readonly relicSetBonusStatPropertyTypeKey: string;
    /** Map key name where the value has property value in "Value" in RelicSetSkillConfig.json */
    readonly relicSetBonusStatPropertyValueKey: string;

    constructor(cachedAssetsManager: CachedAssetsManager) {
        const setBonus = cachedAssetsManager.getExcelData("RelicSetSkillConfig", 101, 2);
        const setBonusPropertyList = new JsonReader(excelJsonOptions, setBonus).get("PropertyList", 0);

        this.relicSetBonusStatPropertyTypeKey = setBonusPropertyList.findObject((_, value) => value.getValue() === "HealRatioBase")?.[0] as string;
        this.relicSetBonusStatPropertyValueKey = setBonusPropertyList.findObject((_, value) => typeof value.getValue("Value") === "number")?.[0] as string;
    }
}
