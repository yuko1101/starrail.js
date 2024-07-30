import { JsonReader } from "config_file.js";
import { CachedAssetsManager } from "./CachedAssetsManager";

export class ObjectKeysManager {
    /** Map key name where the value is StatPropertyType in property lists of set bonuses in RelicSetSkillConfig.json */
    readonly relicSetBonusStatPropertyTypeKey: string;
    /** Map key name where the value has property value in "Value" in RelicSetSkillConfig.json */
    readonly relicSetBonusStatPropertyValueKey: string;

    constructor(cachedAssetsManager: CachedAssetsManager) {
        const setBonus = cachedAssetsManager.getExcelData("RelicSetSkillConfig", 101, 2);
        const setBonusPropertyList = new JsonReader(setBonus).get("PropertyList", 0);

        this.relicSetBonusStatPropertyTypeKey = setBonusPropertyList.findObject((key, value) => value.getValue() === "HealRatioBase")?.[0] as string;
        this.relicSetBonusStatPropertyValueKey = setBonusPropertyList.findObject((key, value) => typeof value.getValue("Value") === "number")?.[0] as string;
    }
}
