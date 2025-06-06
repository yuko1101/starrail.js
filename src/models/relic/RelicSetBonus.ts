import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { TextAssets } from "../assets/TextAssets";
import { getStableHash } from "../../utils/hash_utils";
import { StatPropertyType, StatPropertyValue } from "../StatProperty";
import { excelJsonOptions } from "../../client/CachedAssetsManager";

export class RelicSetBonus {
    readonly setId: number;
    readonly needCount: number;
    readonly client: StarRail;

    readonly description: TextAssets;
    readonly stats: StatPropertyValue[];

    readonly _data: JsonObject;

    constructor(setId: number, needCount: number, client: StarRail) {
        this.setId = setId;
        this.needCount = needCount;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("RelicSetSkillConfig", this.setId, needCount);
        if (!_data) throw new AssetsNotFoundError("RelicSetBonus", `${this.setId}-${this.needCount}`);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.description = new TextAssets(getStableHash(json.getAsString("SkillDesc")), this.client);

        this.stats = json.get("PropertyList").mapArray((_, stat) => new StatPropertyValue(
            stat.getAsString(this.client.cachedAssetsManager.getObjectKeysManager().relicSetBonusStatPropertyTypeKey) as StatPropertyType,
            stat.getAsNumber(this.client.cachedAssetsManager.getObjectKeysManager().relicSetBonusStatPropertyValueKey, "Value"),
            this.client,
        ));


    }
}
