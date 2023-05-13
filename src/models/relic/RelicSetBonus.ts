import { JsonObject } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";

/**
 * @en RelicSetBonus
 */
class RelicSetBonus {
    /**  */
    readonly setId: number;
    /**  */
    readonly needCount: number;
    /**  */
    readonly client: StarRail;

    readonly _data: JsonObject;

    /**
     * @param setId
     * @param needCount
     * @param client
     */
    constructor(setId: number, needCount: number, client: StarRail) {
        this.setId = setId;
        this.needCount = needCount;
        this.client = client;

        const _data = client.cachedAssetsManager.getStarRailCacheData("RelicSetSkillConfig")[this.setId]?.[needCount];
        if (!_data) throw new AssetsNotFoundError("RelicSetBonus", `${this.setId}-${this.needCount}`);
        this._data = _data as JsonObject;

        // const json = new JsonReader(this._data);
    }
}

export default RelicSetBonus;