import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";

export interface RelicLevel {
    expType: number;
    level: number;
    /** Experience to next level */
    exp: number;
}

class RelicExpType {
    readonly expType: number;
    readonly client: StarRail;

    readonly levels: RelicLevel[];

    readonly _data: JsonObject<JsonObject>;

    constructor(expType: number, client: StarRail) {
        this.expType = expType;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("RelicExpType")[this.expType];
        if (!_data) throw new AssetsNotFoundError("RelicExpType", this.expType);
        this._data = _data as JsonObject<JsonObject>;

        const json = new JsonReader(this._data);

        this.levels = json.mapObject((_, v) => { return { expType: v.getAsNumber("TypeID"), level: v.getAsNumber("Level"), exp: v.getAsNumberWithDefault(0, "Exp") }; });
    }

    getLevel(level: number): RelicLevel {
        return this.levels[level];
    }
}

export default RelicExpType;
