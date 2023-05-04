import { JsonManager, JsonObject } from "config_file.js";
import StarRail from "../../../client/StarRail";
import TextAssets from "../../assets/TextAssets";
import AssetsNotFoundError from "../../../errors/AssetsNotFoundError";
import LeveledSkill from "./LeveledSkill";
import ImageAssets from "../../assets/ImageAssets";
import CombatType, { CombatTypeId } from "../../CombatType";

/** @typedef */
export type AttackType = "Normal" | "Ultra" | "MazeNormal" | "Maze" | "BPSkill";

/** @typedef */
export type EffectType = "SingleAttack" | "AoEAttack" | "MazeAttack" | "Enhance" | "Blast" | "Impair" | "Bounce" | "Support" | "Defence" | "Restore";

/**
 * @en Skill
 */
class Skill {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly tag: TextAssets;
    /**  */
    readonly skillTypeDescription: TextAssets;
    /**  */
    readonly attackType: AttackType | null;
    /**  */
    readonly combatType: CombatType | null;
    /**  */
    readonly effectType: EffectType;
    /**  */
    readonly maxLevel: number;
    /**  */
    readonly skillIcon: ImageAssets;
    /** Available only when [attackType](#attackType) is "Ultra" */
    readonly ultraSkillIcon: ImageAssets;

    readonly _data: JsonObject[];

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarSkillConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("Skill", this.id);
        this._data = Object.values(_data) as JsonObject[];

        const json = new JsonManager(this._data[0], true);

        this.name = new TextAssets(json.get("SkillName", "Hash").getAs<number>(), this.client);
        this.tag = new TextAssets(json.get("SkillTag", "Hash").getAs<number>(), this.client);
        this.skillTypeDescription = new TextAssets(json.get("SkillTypeDesc", "Hash").getAs<number>(), this.client);

        this.attackType = json.getAs<AttackType | undefined>("AttackType") ?? null;
        const combatTypeId = json.getAs<CombatTypeId | undefined>("StanceDamageType");
        this.combatType = combatTypeId ? new CombatType(combatTypeId, this.client) : null;
        this.effectType = json.getAs<EffectType>("SkillEffect");

        this.maxLevel = json.getAs<number>("MaxLevel");

        this.skillIcon = new ImageAssets(json.getAs<string>("SkillIcon"), this.client);
        this.ultraSkillIcon = new ImageAssets(json.getAs<string>("UltraSkillIcon"), this.client);

    }

    /**
     * @param level
     */
    getSkillByLevel(level: number): LeveledSkill {
        return new LeveledSkill(this._data[level - 1], this.client);
    }
}

export default Skill;