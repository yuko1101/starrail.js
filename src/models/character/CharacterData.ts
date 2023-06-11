import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import CombatType, { CombatTypeId } from "../CombatType";
import Path, { PathId } from "../Path";
import Skill from "./skill/Skill";
import ImageAssets from "../assets/ImageAssets";
import SkillTreeNode from "./skill/SkillTreeNode";
import Eidolon from "./Eidolon";
import { StatPropertyValue } from "../StatProperty";

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
    readonly maxEnergy: number;
    /**  */
    readonly combatType: CombatType;
    /**  */
    readonly path: Path;
    /**  */
    readonly skills: Skill[];
    /**  */
    readonly skillTreeNodes: SkillTreeNode[];
    /**  */
    readonly eidolons: Eidolon[];
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

        this.maxEnergy = json.getAsNumber("SPNeed", "Value");

        this.combatType = new CombatType(json.getAsString("DamageType") as CombatTypeId, this.client);

        this.path = new Path(json.getAsString("AvatarBaseType") as PathId, this.client);

        this.skills = json.get("SkillList").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        const skillTreeData = this.client.cachedAssetsManager.getStarRailCacheData("AvatarSkillTreeConfig");
        const skillTreeJson = new JsonReader(skillTreeData);
        this.skillTreeNodes = skillTreeJson.filterObject((_, node) => node.getAsNumber("1", "AvatarID") === this.id).map(([nodeId]) => new SkillTreeNode(Number(nodeId), this.client));

        const eidolonsData = this.client.cachedAssetsManager.getStarRailCacheData("AvatarRankConfig");
        const eidolonsJson = new JsonReader(eidolonsData);
        this.eidolons = eidolonsJson.filterObject((eidolonId) => Math.floor(Number(eidolonId) / 100) === this.id).map(([eidolonId]) => new Eidolon(Number(eidolonId), this.client));

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

    /**
     * @param ascension
     * @param level
     */
    getStatsByLevel(ascension: number, level: number): StatPropertyValue[] {
        const ascensionData = this.client.cachedAssetsManager.getStarRailCacheData("AvatarPromotionConfig")[this.id][ascension];
        const ascensionJson = new JsonReader(ascensionData);

        return [
            new StatPropertyValue("BaseAttack", ascensionJson.getAsNumber("AttackBase", "Value") + ascensionJson.getAsNumber("AttackAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseDefence", ascensionJson.getAsNumber("DefenceBase", "Value") + ascensionJson.getAsNumber("DefenceAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseHP", ascensionJson.getAsNumber("HPBase", "Value") + ascensionJson.getAsNumber("HPAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseSpeed", ascensionJson.getAsNumber("SpeedBase", "Value"), this.client),
            new StatPropertyValue("CriticalChanceBase", ascensionJson.getAsNumber("CriticalChance", "Value"), this.client),
            new StatPropertyValue("CriticalDamageBase", ascensionJson.getAsNumber("CriticalDamage", "Value"), this.client),
        ];
    }
}

export default CharacterData;