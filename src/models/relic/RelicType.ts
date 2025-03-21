import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { TextAssets } from "../assets/TextAssets";
import { ImageAssets } from "../assets/ImageAssets";
import { excelJsonOptions } from "../../client/CachedAssetsManager";

/**
 * RelicTypeId|In-game Name
 * ---|---
 * HEAD|Head
 * HAND|Hands
 * BODY|Body
 * FOOT|Feet
 * OBJECT|Link Rope
 * NECK|Planar Sphere
*/
export type RelicTypeId = "HEAD" | "HAND" | "BODY" | "FOOT" | "OBJECT" | "NECK";

export class RelicType {
    readonly id: RelicTypeId;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly icon: ImageAssets;

    readonly _data: JsonObject;

    constructor(id: RelicTypeId, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("RelicBaseType", this.id);
        if (!_data) throw new AssetsNotFoundError("RelicType", this.id);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.name = new TextAssets(json.getAsNumberOrBigint("BaseTypeText", "Hash"), this.client);
        this.icon = new ImageAssets(json.getAsString("BaseTypeIconPath"), this.client);
    }
}
