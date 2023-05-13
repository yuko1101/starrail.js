import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import RelicExpType from "./RelicExpType";
import RelicMainStatGroup from "./RelicMainStatGroup";
import RelicSubStatGroup from "./RelicSubStatGroup";
import RelicSet from "./RelicSet";

/** @typedef */
export type RelicType = "HEAD" | "HAND" | "BODY" | "FOOT" | "OBJECT" | "NECK";

/**
 * @en RelicData
 */
class RelicData {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

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
    readonly set: RelicSet;

    readonly _data: JsonObject;

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

        const json = new JsonReader(this._data);

        this.type = json.getAsString("Type") as RelicType;

        this.stars = Number(json.getAsString("Rarity").slice(-1));

        this.maxLevel = json.getAsNumber("MaxLevel");

        this.expType = new RelicExpType(json.getAsNumber("ExpType"), this.client);

        this.mainStatGroup = new RelicMainStatGroup(json.getAsNumber("MainAffixGroup"), this.client);
        this.subStatGroup = new RelicSubStatGroup(json.getAsNumber("SubAffixGroup"), this.client);

        this.expProvide = json.getAsNumber("ExpProvide");
        this.coinCost = json.getAsNumber("CoinCost");

        this.set = new RelicSet(json.getAsNumber("SetID"), this.client);

    }
}

export default RelicData;
