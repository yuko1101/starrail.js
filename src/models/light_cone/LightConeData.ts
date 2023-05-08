import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import Path, { PathId } from "../Path";
import LightConeExpType from "./LightConeExpType";
import ImageAssets from "../assets/ImageAssets";

/**
 * @en LightConeData
 */
class LightConeData {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly itemDescription: TextAssets;
    /**  */
    readonly path: Path;
    /**  */
    readonly maxAscension: number;
    /**  */
    readonly maxSuperimposition: number;
    /**  */
    readonly expType: LightConeExpType;
    /** Experience value provided by the light cone when used as a material */
    readonly expProvide: number;
    /** Coin cost to level up other light cones when the light cone is used as a material */
    readonly coinCost: number;
    /**  */
    readonly icon: ImageAssets;
    /**  */
    readonly cardImage: ImageAssets;

    readonly _data: JsonObject;
    readonly _itemData: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("EquipmentConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("LightCone", this.id);
        this._data = _data;

        const _itemData: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("ItemConfigEquipment")[this.id];
        if (!_itemData) throw new AssetsNotFoundError("LightCone Item", this.id);
        this._itemData = _itemData;

        const json = new JsonReader(this._data);
        const itemJson = new JsonReader(this._itemData);

        this.name = new TextAssets(json.getAsNumber("EquipmentName", "Hash"), this.client);
        this.description = new TextAssets(itemJson.getAsNumber("ItemBGDesc", "Hash"), this.client);
        this.itemDescription = new TextAssets(itemJson.getAsNumber("ItemDesc", "Hash"), this.client);

        this.path = new Path(json.getAsStringWithDefault("Unknown", "AvatarBaseType") as PathId, this.client);

        this.maxAscension = json.getAsNumber("MaxPromotion");
        this.maxSuperimposition = json.getAsNumber("MaxRank");

        this.expType = new LightConeExpType(json.getAsNumber("ExpType"), this.client);

        this.expProvide = json.getAsNumber("ExpProvide");
        this.coinCost = json.getAsNumber("CoinCost");

        this.icon = new ImageAssets(json.getAsString("ThumbnailPath"), this.client);
        this.cardImage = new ImageAssets(json.getAsString("ImagePath"), this.client);
    }
}

export default LightConeData;
