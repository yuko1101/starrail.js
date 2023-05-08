import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import TextAssets from "./assets/TextAssets";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";

/**
 * @typedef
 * @example
 * |PathId|In-game Name|
 * |---|---|
 * |Warrior|Destruction|
 * |Rogue|The Hunt|
 * |Mage|Erudition|
 * |Shaman|Harmony|
 * |Warlock|Nihility|
 * |Knight|Preservation|
 * |Priest|Abundance|
 */
export type PathId = "Warrior" | "Rogue" | "Mage" | "Shaman" | "Warlock" | "Knight" | "Priest" | "Unknown";

/**
 * @en Path
 */
class Path {
    /**  */
    readonly id: PathId;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly description: TextAssets;

    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: PathId, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarBaseType")[this.id];
        if (!_data) throw new AssetsNotFoundError("Path", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.name = new TextAssets(json.getAsNumber("BaseTypeText", "Hash"), this.client);
        this.description = new TextAssets(json.getAsNumber("BaseTypeDesc", "Hash"), this.client);
    }
}

export default Path;