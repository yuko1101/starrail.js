import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import ImageAssets from "../assets/ImageAssets";
import RelicSetBonus from "./RelicSetBonus";

/**
 * @en RelicSet
 */
class RelicSet {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly icon: ImageAssets;
    /**  */
    readonly figureIcon: ImageAssets;
    /**  */
    readonly setBonus: RelicSetBonus[];

    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getStarRailCacheData("RelicSetConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("RelicSet", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.name = new TextAssets(json.getAsNumber("SetName", "Hash"), this.client);

        this.icon = new ImageAssets(json.getAsString("SetIconPath"), this.client);
        this.figureIcon = new ImageAssets(json.getAsString("SetIconFigurePath"), this.client);

        this.setBonus = json.get("SetSkillList").mapArray((_, needCount) => new RelicSetBonus(this.id, needCount.getAsNumber(), this.client));
    }
}

export default RelicSet;
