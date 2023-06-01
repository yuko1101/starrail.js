import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import ImageAssets from "../assets/ImageAssets";
import TextAssets from "../assets/TextAssets";
import { getStableHash } from "../../utils/hash_utils";

/**
 * @en Eidolon
 */
class Eidolon {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;
    /**  */
    readonly rank: number;
    /**
     * This is the icon of the eidolon, not the picture of the eidolon with the character in them.
     * If you would like to get it, you can find it in `ui/ui3d/rank/_dependencies/textures`.
     */
    readonly icon: ImageAssets;
    /**  */
    readonly name: TextAssets;
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

        const _data: JsonObject | undefined = this.client.cachedAssetsManager.getStarRailCacheData("AvatarRankConfig")[id];
        if (!_data) throw new AssetsNotFoundError("Eidolon", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.rank = json.getAsNumber("Rank");

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);

        this.name = new TextAssets(getStableHash(json.getAsString("Name")), this.client);
        // TODO: replace placeholders with numbers in Param
        this.description = new TextAssets(getStableHash(json.getAsString("Desc")), this.client);
    }
}

export default Eidolon;