import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import StatProperty, { StatPropertyType, StatPropertyValue } from "../StatProperty";
import DynamicTextAssets from "../assets/DynamicTextAssets";

/**
 * @en LightConeSuperimposition
 */
class LightConeSuperimposition {
    /**  */
    readonly id: number;
    /**  */
    readonly level: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly paramList: number[];
    /**  */
    readonly name: TextAssets;
    /**  */
    readonly description: DynamicTextAssets;
    /**  */
    readonly stats: StatPropertyValue[];

    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, level: number, client: StarRail) {
        this.id = id;
        this.level = level;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("EquipmentSkillConfig")[this.id]?.[this.level] as JsonObject | undefined;
        if (!_data) throw new AssetsNotFoundError("LightConeSuperimposition", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.paramList = json.get("ParamList").mapArray((_, v) => v.getAsNumber("Value"));

        this.name = new TextAssets(json.getAsNumber("SkillName", "Hash"), this.client);
        this.description = new DynamicTextAssets(json.getAsNumber("SkillDesc", "Hash"), { paramList: this.paramList }, this.client);

        this.stats = json.get("AbilityProperty").mapArray((_, prop) => {
            if (prop.getAsString("PropertyType") === "AllDamageTypeAddedRatio") {
                return StatProperty.ALL_DAMAGE_TYPES.map(damageType => new StatPropertyValue(damageType, prop.getAsNumber("Value", "Value"), this.client));
            }
            return [new StatPropertyValue(prop.getAsString("PropertyType") as StatPropertyType, prop.getAsNumber("Value", "Value"), this.client)];
        }).flat();
    }
}

export default LightConeSuperimposition;