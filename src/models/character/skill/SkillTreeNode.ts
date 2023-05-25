import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../../client/StarRail";
import AssetsNotFoundError from "../../../errors/AssetsNotFoundError";
import LeveledSkillTreeNode from "./LeveledSkillTreeNode";
import Skill from "./Skill";
import TextAssets from "../../assets/TextAssets";
import { getStableHash } from "../../../utils/hash_utils";
import ImageAssets from "../../assets/ImageAssets";

/**
 * @en SkillTreeNode
 */
class SkillTreeNode {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly maxLevel: number;
    /**  */
    readonly isUnlockedByDefault: boolean;
    /**  */
    readonly levelUpSkills: Skill[];
    /**  */
    readonly name: TextAssets;
    /**  */
    readonly icon: ImageAssets;

    readonly _data: JsonObject[];

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarSkillTreeConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("SkillTreeNode", this.id);
        this._data = Object.values(_data) as JsonObject[];

        const json = new JsonReader(this._data[0]);

        this.maxLevel = json.getAsNumber("MaxLevel");
        this.isUnlockedByDefault = json.getAsBooleanWithDefault(false, "DefaultUnlock");

        this.levelUpSkills = json.get("LevelUpSkillID").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        if (this.levelUpSkills.length === 0 && json.getAsString("PointName") === "") throw new Error(`SkillTreeNode must have a name.\nID: ${this.id}, Level: ${(this as unknown as { [s: string]: unknown })["level"] ?? 1}\nIf you encounter this error, please create an issue at https://github.com/yuko1101/starrail.js/issues`);
        this.name = this.levelUpSkills.length > 0 ? this.levelUpSkills[0].name : new TextAssets(getStableHash(json.getAsString("PointName")), this.client);

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);
    }

    /**
     * @param level
     */
    getSkillTreeNodeByLevel(level: number): LeveledSkillTreeNode {
        return new LeveledSkillTreeNode(this._data[level - 1], this.client);
    }
}

export default SkillTreeNode;