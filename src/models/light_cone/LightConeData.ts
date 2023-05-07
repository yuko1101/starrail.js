import { JsonManager, JsonObject } from "config_file.js";
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

        const json = new JsonManager(this._data, true, true);
        const itemJson = new JsonManager(this._itemData, true, true);

        this.name = new TextAssets(json.get("EquipmentName", "Hash").getAs<number>(), this.client);
        this.description = new TextAssets(itemJson.get("ItemBGDesc", "Hash").getAs<number>(), this.client);
        this.itemDescription = new TextAssets(itemJson.get("ItemDesc", "Hash").getAs<number>(), this.client);

        this.path = new Path(json.getAs<PathId | undefined>("AvatarBaseType"), this.client);

        this.maxAscension = json.getAs<number>("MaxPromotion");
        this.maxSuperimposition = json.getAs<number>("MaxRank");

        this.expType = new LightConeExpType(json.getAs<number>("ExpType"), this.client);

        this.expProvide = json.getAs<number>("ExpProvide");
        this.coinCost = json.getAs<number>("CoinCost");

        this.icon = new ImageAssets(json.getAs<string>("ThumbnailPath"), this.client);
        this.cardImage = new ImageAssets(json.getAs<string>("ImagePath"), this.client);
    }
}

export default LightConeData;
