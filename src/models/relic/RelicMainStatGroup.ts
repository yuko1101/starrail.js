import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import StatProperty, { StatPropertyType } from "../StatProperty";

/** @typedef */
export interface RelicMainStatData {
    id: number;
    groupId: number;
    statProperty: StatProperty;
}

/**
 * @en RelicMainStatGroup
 */
class RelicMainStatGroup {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly mainStats: RelicMainStatData[];

    readonly _data: JsonObject<JsonObject>;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("RelicMainAffixConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("RelicMainStatGroup", this.id);
        this._data = _data as JsonObject<JsonObject>;

        const json = new JsonReader(this._data);

        this.mainStats = json.mapObject((_, v) => {
            return {
                id: v.getAsNumber("AffixID"),
                groupId: this.id,
                statProperty: new StatProperty(v.getAsString("Property") as StatPropertyType, this.client),
            };
        });
    }
}

export default RelicMainStatGroup;