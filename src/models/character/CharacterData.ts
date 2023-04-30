import { JsonObject } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";

/**
 * @en CharacterData
 */
class CharacterData {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;
    /**  */
    readonly name: TextAssets;
    /**  */
    readonly fullName: TextAssets;
    /**  */
    readonly description: TextAssets;


    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;

        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarConfig.json")[this.id];
        if (!_data) throw new AssetsNotFoundError("Character", this.id);
        this._data = _data;

        this.name = new TextAssets((this._data["AvatarName"] as JsonObject)["Hash"] as number, this.client);
        this.fullName = new TextAssets((this._data["AvatarFullName"] as JsonObject)["Hash"] as number, this.client);

        this.description = new TextAssets((this._data["AvatarDesc"] as JsonObject)["Hash"] as number, this.client);

    }
}

export default CharacterData;