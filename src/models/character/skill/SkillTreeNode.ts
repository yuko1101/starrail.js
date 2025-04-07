import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../../client/StarRail";
import { AssetsNotFoundError } from "../../../errors/AssetsNotFoundError";
import { LeveledSkill, Skill } from "./Skill";
import { TextAssets } from "../../assets/TextAssets";
import { getStableHash } from "../../../utils/hash_utils";
import { ImageAssets } from "../../assets/ImageAssets";
import { StatPropertyType, StatPropertyValue } from "../../StatProperty";
import { SkillLevel } from "./SkillLevel";
import { DynamicTextAssets } from "../../assets/DynamicTextAssets";
import { excelJsonOptions } from "../../../client/CachedAssetsManager";
import { nonNullable } from "../../../utils/ts_utils";

export class SkillTreeNode {
    readonly id: number;
    readonly client: StarRail;

    readonly characterId: number;
    readonly maxLevel: number;
    readonly isUnlockedByDefault: boolean;
    readonly levelUpSkills: Skill[];
    readonly name: TextAssets;
    readonly icon: ImageAssets;
    readonly previousNodeId: number | null;

    readonly _nodesData: JsonObject[];

    constructor(id: number, client: StarRail, nodeIndexToUse = 0) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("AvatarSkillTreeConfig", this.id);
        if (!_data) throw new AssetsNotFoundError("SkillTreeNode", this.id);
        this._nodesData = Object.values(_data) as JsonObject[];

        const json = new JsonReader(excelJsonOptions, this._nodesData[nodeIndexToUse]);

        this.characterId = json.getAsNumber("AvatarID");

        this.maxLevel = json.getAsNumber("MaxLevel");
        this.isUnlockedByDefault = json.getAsBooleanWithDefault(false, "DefaultUnlock");

        this.levelUpSkills = json.get("LevelUpSkillID").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        if (this.levelUpSkills.length === 0 && json.getAsString("PointName") === "") throw new Error(`SkillTreeNode must have a name.\nID: ${this.id}, Level: ${(this as unknown as Record<string, unknown>)["level"] ?? 1}\nIf you encounter this error, please create an issue at https://github.com/yuko1101/starrail.js/issues`);
        this.name = this.levelUpSkills.length > 0 ? this.levelUpSkills[0].name : new TextAssets(getStableHash(json.getAsString("PointName")), this.client);

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);

        this.previousNodeId = json.getAsNumberWithDefault(null, "PrePoint", 0);
    }

    getSkillTreeNodeByLevel(level: SkillLevel): LeveledSkillTreeNode {
        return new LeveledSkillTreeNode(this._nodesData[level.base - 1], level, this.client);
    }

    getPreviousNodes(): SkillTreeNode | null {
        if (this.previousNodeId === null) return null;
        return new SkillTreeNode(this.previousNodeId, this.client);
    }

    getNextNodes(): SkillTreeNode[] {
        const nodesData = this.client.cachedAssetsManager._getExcelData("AvatarSkillTreeConfig");
        const json = new JsonReader(excelJsonOptions, nodesData);
        const nextNodes = json.filterObject((_, node) => node.getAsNumberWithDefault(null, "PrePoint", 0) === this.id);
        return nextNodes.map(([nodeId]) => new SkillTreeNode(Number(nodeId), this.client));
    }
}

export class LeveledSkillTreeNode extends SkillTreeNode {
    readonly level: SkillLevel;
    readonly stats: StatPropertyValue[];
    readonly paramList: number[];
    /** This text assets can be invalid which throws AssetsNotFoundError in its `get` method. For full description use {@apilink LeveledSkillTreeNode#getFullDescription} method instead. */
    readonly description: DynamicTextAssets;

    readonly _data: JsonObject;

    constructor(data: JsonObject, level: SkillLevel, client: StarRail) {
        // skill tree node data with base level
        const json = new JsonReader(excelJsonOptions, data);
        const id = json.getAsNumber("PointID");
        super(id, client, level.base - 1);
        this._data = data;

        this.level = level;

        // since the skill that can have extra level does not have any stats, we can safely assume that we can use the base level skill to get the stats
        this.stats = json.get("StatusAddList").mapArray((_, s) => new StatPropertyValue(s.getAsString("PropertyType") as StatPropertyType, s.getAsNumber("Value", "Value"), this.client));

        this.paramList = this.paramList = json.get("ParamList").mapArray((_, v) => v.getAsNumber("Value"));

        this.description = new DynamicTextAssets(getStableHash(json.getAsString("PointDesc")), { paramList: this.paramList }, this.client);
    }

    hasSimpleDescription(): boolean {
        return this.levelUpSkills.length > 0 && this.levelUpSkills.some(s => s.getSkillByLevel(this.level).simpleDescription);
    }

    getFullDescription(simple: boolean): { desc: DynamicTextAssets, ref: LeveledSkill | StatPropertyValue | null, simple: boolean }[] {
        if (this.levelUpSkills.length > 0) {
            const leveledSkills = this.levelUpSkills.map(s => s.getSkillByLevel(this.level));
            const skillDescriptions = leveledSkills.map(s => {
                const fallback = s.description ?? s.simpleDescription;
                const desc = (simple ? s.simpleDescription : s.description) ?? fallback;
                if (!desc) return null;
                return { desc, ref: s, simple: desc === s.simpleDescription };
            }).filter(nonNullable);
            if (skillDescriptions.length > 0) return skillDescriptions;
        }
        if (this.stats.length > 0) {
            const statDescriptions = this.stats.map(s => {
                const desc = s.nameSkillTree;
                if (!desc) return null;
                return { desc, ref: s, simple: false };
            }).filter(nonNullable);
            if (statDescriptions.length > 0) return statDescriptions;
        }
        return [{ desc: this.description, ref: null, simple: false }];
    }
}