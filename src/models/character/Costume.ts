import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { TextAssets } from "../assets/TextAssets";
import { excelJsonOptions } from "../../client/CachedAssetsManager";

export class Costume {
    readonly id: number;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly characterId: number;

    readonly _data: JsonObject;

    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("AvatarSkin", this.id);
        if (!_data) throw new AssetsNotFoundError("Costume", this.id);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.name = new TextAssets(json.getAsNumberOrBigint("AvatarSkinName", "Hash"), this.client);
        this.characterId = json.getAsNumber("AvatarID");

    }
}