import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";

/** @typedef */
export interface LightConeLevel {
    expType: number;
    level: number;
    /** Experience to next level */
    exp: number;
}

/**
 * @en LightConeExpType
 */
class LightConeExpType {
    /**  */
    readonly expType: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly levels: LightConeLevel[];

    readonly _data: JsonObject<JsonObject>;

    /**
     * @param expType
     * @param client
     */
    constructor(expType: number, client: StarRail) {
        this.expType = expType;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("EquipmentExpType")[this.expType];
        if (!_data) throw new AssetsNotFoundError("LightConeExpType", this.expType);
        this._data = _data as JsonObject<JsonObject>;

        const json = new JsonReader(this._data);

        this.levels = json.mapObject((_, v) => { return { expType: v.getAsNumber("ExpType"), level: v.getAsNumber("Level"), exp: v.getAsNumberWithDefault(0, "Exp") }; });
    }

    /**
     * @param level
     */
    getLevel(level: number): LightConeLevel {
        return this.levels[level - 1];
    }
}

export default LightConeExpType;
