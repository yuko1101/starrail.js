import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";

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
    readonly name: TextAssets;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly paramList: number[];

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

        this.name = new TextAssets(json.getAsNumber("SkillName", "Hash"), this.client);
        // TODO: replace placeholders with numbers from paramList
        this.description = new TextAssets(json.getAsNumber("SkillDesc", "Hash"), this.client);

        this.paramList = json.get("ParamList").mapArray((_, v) => v.getAsNumber("Value"));
    }
}

export default LightConeSuperimposition;