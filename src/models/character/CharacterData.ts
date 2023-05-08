import { JsonObject, JsonReader } from "config_file.js";
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
    readonly stars: number;
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

        const json = new JsonReader(this._data);
        const itemJson = new JsonReader(this._itemData);

        this.name = new TextAssets(json.getAsNumber("AvatarName", "Hash"), this.client);
        this.description = new TextAssets(itemJson.getAsNumber("ItemBGDesc", "Hash"), this.client);

        this.stars = Number(json.getAsString("Rarity").slice(-1));

        this.combatType = new CombatType(json.getAsString("DamageType") as CombatTypeId, this.client);

        this.path = new Path(json.getAsString("AvatarBaseType") as PathId, this.client);

        this.skills = json.get("SkillList").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        this.icon = new ImageAssets(json.getAsString("DefaultAvatarHeadIconPath"), this.client);
        this.sideIcon = new ImageAssets(json.getAsString("AvatarSideIconPath"), this.client);
        this.miniIcon = new ImageAssets(json.getAsString("AvatarMiniIconPath"), this.client);
        this.teamActionIcon = new ImageAssets(json.getAsString("ActionAvatarHeadIconPath"), this.client);
        this.teamWaitingIcon = new ImageAssets(json.getAsString("WaitingAvatarHeadIconPath"), this.client);
        this.splashImage = new ImageAssets(json.getAsString("AvatarCutinFrontImgPath"), this.client);
        this.splashCutInFigureImage = new ImageAssets(json.getAsString("AvatarCutinImgPath"), this.client);
        this.splashCutInBackgroundImage = new ImageAssets(json.getAsString("AvatarCutinBgImgPath"), this.client);
        this.shopItemIcon = new ImageAssets(itemJson.getAsString("ItemAvatarIconPath"), this.client);
    }
}

export default CharacterData;