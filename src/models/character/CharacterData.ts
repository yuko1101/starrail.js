import { JsonManager, JsonObject } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import CombatType, { CombatTypeId } from "../CombatType";
import Path, { PathId } from "../Path";
import Skill from "./skill/Skill";
import ImageAssets from "../assets/ImageAssets";

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
    readonly description: TextAssets;
    /**  */
    readonly combatType: CombatType;
    /**  */
    readonly path: Path;
    /**  */
    readonly skills: Skill[];
    /**  */
    readonly icon: ImageAssets;
    /**  */
    readonly sideIcon: ImageAssets;
    /**  */
    readonly miniIcon: ImageAssets;
    /**  */
    readonly teamActionIcon: ImageAssets;
    /**  */
    readonly teamWaitingIcon: ImageAssets;
    /**  */
    readonly splashImage: ImageAssets;
    /**  */
    readonly splashCutInFigureImage: ImageAssets;
    /**  */
    readonly splashCutInBackgroundImage: ImageAssets;
    /**  */
    readonly shopItemIcon: ImageAssets;

    readonly _data: JsonObject;
    readonly _itemData: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;

        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("Character", this.id);
        this._data = _data;

        const _itemData: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("ItemConfigAvatar")[this.id];
        if (!_itemData) throw new AssetsNotFoundError("Character Item", this.id);
        this._itemData = _itemData;

        const json = new JsonManager(this._data, true, true);
        const itemJson = new JsonManager(this._itemData, true, true);

        this.name = new TextAssets(json.get("AvatarName", "Hash").getAs<number>(), this.client);
        this.description = new TextAssets(itemJson.get("ItemBGDesc", "Hash").getAs<number>(), this.client);

        this.combatType = new CombatType(json.getAs<CombatTypeId>("DamageType"), this.client);

        this.path = new Path(json.getAs<PathId>("AvatarBaseType"), this.client);

        this.skills = json.getAs<number[]>("SkillList").map(skillId => new Skill(skillId, this.client));

        this.icon = new ImageAssets(json.getAs<string>("DefaultAvatarHeadIconPath"), this.client);
        this.sideIcon = new ImageAssets(json.getAs<string>("AvatarSideIconPath"), this.client);
        this.miniIcon = new ImageAssets(json.getAs<string>("AvatarMiniIconPath"), this.client);
        this.teamActionIcon = new ImageAssets(json.getAs<string>("ActionAvatarHeadIconPath"), this.client);
        this.teamWaitingIcon = new ImageAssets(json.getAs<string>("WaitingAvatarHeadIconPath"), this.client);
        this.splashImage = new ImageAssets(json.getAs<string>("AvatarCutinFrontImgPath"), this.client);
        this.splashCutInFigureImage = new ImageAssets(json.getAs<string>("AvatarCutinImgPath"), this.client);
        this.splashCutInBackgroundImage = new ImageAssets(json.getAs<string>("AvatarCutinBgImgPath"), this.client);
        this.shopItemIcon = new ImageAssets(itemJson.getAs<string>("ItemAvatarIconPath"), this.client);
    }
}

export default CharacterData;