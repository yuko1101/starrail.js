import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { StatProperty, StatPropertyType } from "../StatProperty";
import { excelJsonOptions } from "../../client/CachedAssetsManager";

export interface RelicSubStatData {
    id: number;
    groupId: number;
    statProperty: StatProperty;
    baseValue: number;
    stepValue: number;
}

export class RelicSubStatGroup {
    readonly id: number;
    readonly client: StarRail;

    readonly subStats: RelicSubStatData[];

    readonly _data: JsonObject<JsonObject>;

    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("RelicSubAffixConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("RelicSubStatGroup", this.id);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.subStats = json.mapObject((_, v) => {
            return {
                id: v.getAsNumber("AffixID"),
                groupId: this.id,
                statProperty: new StatProperty(v.getAsString("Property") as StatPropertyType, this.client),
                baseValue: v.getAsNumber("BaseValue", "Value"),
                stepValue: v.getAsNumber("StepValue", "Value"),
            };
        });
    }
}
