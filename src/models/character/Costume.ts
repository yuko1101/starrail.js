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
    readonly _itemData: JsonObject;

    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("AvatarSkin", this.id);
        if (!_data) throw new AssetsNotFoundError("Costume", this.id);
        this._data = _data;
        const _itemData = client.cachedAssetsManager.getExcelData("ItemConfigAvatarSkin", this.id);
        if (!_itemData) throw new AssetsNotFoundError("Costume ItemConfig", this.id);
        this._itemData = _itemData;

        const json = new JsonReader(excelJsonOptions, this._data);
        const itemJson = new JsonReader(excelJsonOptions, this._itemData);

        this.name = new TextAssets(itemJson.getAsNumberOrBigint("ItemName", "Hash"), this.client);
        this.characterId = json.getAsNumber("AvatarID");

    }
}
