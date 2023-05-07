import { JsonObject } from "config_file.js";
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

        this.levels = Object.values(this._data).map(e => { return { expType: e.ExpType as number, level: e.Level as number, exp: (e.Exp ?? 0) as number }; });
    }

    /**
     * @param level
     */
    getLevel(level: number): LightConeLevel {
        return this.levels[level - 1];
    }
}

export default LightConeExpType;
