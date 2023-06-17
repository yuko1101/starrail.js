import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import RelicExpType from "./RelicExpType";
import RelicMainStatGroup from "./RelicMainStatGroup";
import RelicSubStatGroup from "./RelicSubStatGroup";
import RelicSet from "./RelicSet";
import TextAssets from "../assets/TextAssets";
import ImageAssets from "../assets/ImageAssets";
import RelicType, { RelicTypeId } from "./RelicType";

/**
 * @en RelicData
 */
class RelicData {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly type: RelicType;
    /**  */
    readonly stars: number;
    /**  */
    readonly maxLevel: number;
    /**  */
    readonly expType: RelicExpType;
    /**  */
    readonly mainStatGroup: RelicMainStatGroup;
    /**  */
    readonly subStatGroup: RelicSubStatGroup;
    /** Experience value provided by the light cone when used as a material */
    readonly expProvide: number;
    /** Coin cost to level up other light cones when the light cone is used as a material */
    readonly coinCost: number;
    /**  */
    readonly icon: ImageAssets;
    /**  */
    readonly figureIcon: ImageAssets;
    /**  */
    readonly set: RelicSet;

    readonly _data: JsonObject;
    readonly _itemData: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getStarRailCacheData("RelicConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("Relic", this.id);
        this._data = _data;

        const _itemData: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("ItemConfigRelic")[this.id];
        if (!_itemData) throw new AssetsNotFoundError("Relic Item", this.id);
        this._itemData = _itemData;

        const json = new JsonReader(this._data);
        const itemJson = new JsonReader(this._itemData);

        this.name = new TextAssets(itemJson.getAsNumber("ItemName", "Hash"), this.client);
        this.description = new TextAssets(itemJson.getAsNumber("ItemBGDesc", "Hash"), this.client);

        this.type = new RelicType(json.getAsString("Type") as RelicTypeId, this.client);

        this.stars = Number(json.getAsString("Rarity").slice(-1));

        this.maxLevel = json.getAsNumber("MaxLevel");

        this.expType = new RelicExpType(json.getAsNumber("ExpType"), this.client);

        this.mainStatGroup = new RelicMainStatGroup(json.getAsNumber("MainAffixGroup"), this.client);
        this.subStatGroup = new RelicSubStatGroup(json.getAsNumber("SubAffixGroup"), this.client);

        this.expProvide = json.getAsNumber("ExpProvide");
        this.coinCost = json.getAsNumber("CoinCost");

        this.icon = new ImageAssets(itemJson.getAsString("ItemIconPath"), this.client);
        this.figureIcon = new ImageAssets(itemJson.getAsString("ItemFigureIconPath"), this.client);

        this.set = new RelicSet(json.getAsNumber("SetID"), this.client);

    }
}

export default RelicData;
