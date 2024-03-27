import { JsonElement, JsonReader } from "config_file.js";
import CachedAssetsManager from "./CachedAssetsManager";

class ObjectKeysManager {
    /** Map key name where the value is StatPropertyType in property lists of set bonuses in RelicSetSkillConfig.json */
    readonly relicSetBonusStatPropertyTypeKey: string;
    /** Map key name where the value has property value in "Value" in RelicSetSkillConfig.json */
    readonly relicSetBonusStatPropertyValueKey: string;

    constructor(cachedAssetsManager: CachedAssetsManager) {
        const setBonus: JsonElement | undefined = cachedAssetsManager.getStarRailCacheData("RelicSetSkillConfig")[101][2];
        const setBonusPropertyList = new JsonReader(setBonus).get("PropertyList", 0);

        this.relicSetBonusStatPropertyTypeKey = setBonusPropertyList.findObject((key, value) => value.getValue() === "HealRatioBase")?.[0] as string;
        this.relicSetBonusStatPropertyValueKey = setBonusPropertyList.findObject((key, value) => typeof value.getValue("Value") === "number")?.[0] as string;
    }
}

export default ObjectKeysManager;