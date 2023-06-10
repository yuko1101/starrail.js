import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import Path, { PathId } from "../Path";
import LightConeExpType from "./LightConeExpType";
import ImageAssets from "../assets/ImageAssets";
import LightConeSuperimposition from "./LightConeSuperimposition";
import { StatPropertyValue } from "../StatProperty";

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
    readonly stars: number;
    /**  */
    readonly path: Path;
    /**  */
    readonly maxAscension: number;
    /**  */
    readonly maxSuperimposition: number;
    /**  */
    readonly superimpositions: LightConeSuperimposition[];
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

        this.stars = Number(json.getAsString("Rarity").slice(-1));

        this.path = new Path(json.getAsStringWithDefault("Unknown", "AvatarBaseType") as PathId, this.client);

        this.maxAscension = json.getAsNumber("MaxPromotion");
        this.maxSuperimposition = json.getAsNumber("MaxRank");

        const skillId = json.getAsNumber("SkillID");
        const superimpositions: LightConeSuperimposition[] = [];
        for (let i = 1; i <= this.maxSuperimposition; i++) {
            superimpositions.push(new LightConeSuperimposition(skillId, i, this.client));
        }
        this.superimpositions = superimpositions;

        this.expType = new LightConeExpType(json.getAsNumber("ExpType"), this.client);

        this.expProvide = json.getAsNumber("ExpProvide");
        this.coinCost = json.getAsNumber("CoinCost");

        this.icon = new ImageAssets(json.getAsString("ThumbnailPath"), this.client);
        this.cardImage = new ImageAssets(json.getAsString("ImagePath"), this.client);
    }

    /**
     * @param ascension
     * @param level
     */
    getStatsByLevel(ascension: number, level: number): StatPropertyValue[] {
        const ascensionData = this.client.cachedAssetsManager.getStarRailCacheData("EquipmentPromotionConfig")[this.id][ascension];
        const ascensionJson = new JsonReader(ascensionData);

        return [
            new StatPropertyValue("BaseHP", ascensionJson.getAsNumber("BaseHP", "Value") + ascensionJson.getAsNumber("BaseHPAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseAttack", ascensionJson.getAsNumber("BaseAttack", "Value") + ascensionJson.getAsNumber("BaseAttackAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseDefence", ascensionJson.getAsNumber("BaseDefence", "Value") + ascensionJson.getAsNumber("BaseDefenceAdd", "Value") * (level - 1), this.client),
        ];
    }

    /**
     * @param superimposition
     */
    getSuperimpositionStats(superimposition: number): StatPropertyValue[] {
        return this.superimpositions[superimposition - 1].stats;
    }
}

export default LightConeData;
