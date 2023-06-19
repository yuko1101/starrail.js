import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../../client/StarRail";
import AssetsNotFoundError from "../../../errors/AssetsNotFoundError";
import Skill from "./Skill";
import TextAssets from "../../assets/TextAssets";
import { getStableHash } from "../../../utils/hash_utils";
import ImageAssets from "../../assets/ImageAssets";
import { StatPropertyType, StatPropertyValue } from "../../StatProperty";

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
    /**  */
    readonly previousNodeIds: number[];

    readonly _nodesData: JsonObject[];

    /**
     * @param id
     * @param client
     * @param nodeIndexToUse
     */
    constructor(id: number, client: StarRail, nodeIndexToUse = 0) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarSkillTreeConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("SkillTreeNode", this.id);
        this._nodesData = Object.values(_data) as JsonObject[];

        const json = new JsonReader(this._nodesData[nodeIndexToUse]);

        this.maxLevel = json.getAsNumber("MaxLevel");
        this.isUnlockedByDefault = json.getAsBooleanWithDefault(false, "DefaultUnlock");

        this.levelUpSkills = json.get("LevelUpSkillID").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        if (this.levelUpSkills.length === 0 && json.getAsString("PointName") === "") throw new Error(`SkillTreeNode must have a name.\nID: ${this.id}, Level: ${(this as unknown as { [s: string]: unknown })["level"] ?? 1}\nIf you encounter this error, please create an issue at https://github.com/yuko1101/starrail.js/issues`);
        this.name = this.levelUpSkills.length > 0 ? this.levelUpSkills[0].name : new TextAssets(getStableHash(json.getAsString("PointName")), this.client);

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);

        this.previousNodeIds = json.get("PrePoint").mapArray((_, nodeId) => nodeId.getAsNumber());
    }

    /**
     * @param level
     */
    getSkillTreeNodeByLevel(level: number): LeveledSkillTreeNode {
        return new LeveledSkillTreeNode(this._nodesData[level - 1], this.client);
    }

    /**
     * As of HSR ver1.1, a node cannot have two or more previous node.
     * In other words, this method returns an empty array or an array with only one element.
     */
    getPreviousNodes(): SkillTreeNode[] {
        return this.previousNodeIds.map(nodeId => new SkillTreeNode(nodeId, this.client));
    }
}

export default SkillTreeNode;

/**
 * @en LeveledSkillTreeNode
 * @extends {SkillTreeNode}
 */
export class LeveledSkillTreeNode extends SkillTreeNode {
    /**  */
    readonly level: number;
    /**  */
    readonly characterId: number;
    /**  */
    readonly stats: StatPropertyValue[];

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        const json = new JsonReader(data);
        const id = json.getAsNumber("PointID");
        const level = json.getAsNumber("Level");
        super(id, client, level - 1);

        this._data = data;

        this.level = level;
        this.characterId = json.getAsNumber("AvatarID");

        this.stats = json.get("StatusAddList").mapArray((_, s) => new StatPropertyValue(s.getAsString("PropertyType") as StatPropertyType, s.getAsNumber("Value", "Value"), this.client));
    }
}