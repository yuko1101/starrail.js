import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";

export interface LightConeLevel {
    expType: number;
    level: number;
    /** Experience to next level */
    exp: number;
}

export class LightConeExpType {
    readonly expType: number;
    readonly client: StarRail;

    readonly levels: LightConeLevel[];

    readonly _data: JsonObject<JsonObject>;

    constructor(expType: number, client: StarRail) {
        this.expType = expType;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("EquipmentExpType", this.expType);
        if (!_data) throw new AssetsNotFoundError("LightConeExpType", this.expType);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.levels = json.mapObject((_, v) => { return { expType: v.getAsNumber("ExpType"), level: v.getAsNumber("Level"), exp: v.getAsNumberWithDefault(0, "Exp") }; });
    }

    getLevel(level: number): LightConeLevel {
        return this.levels[level - 1];
    }
}
