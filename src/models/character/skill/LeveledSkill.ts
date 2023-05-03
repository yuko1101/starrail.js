import { JsonManager, JsonObject } from "config_file.js";
import StarRail from "../../../client/StarRail";
import TextAssets from "../../assets/TextAssets";
import { AttackType, EffectType } from "./Skill";
import CombatType, { CombatTypeId } from "../../CombatType";
import ImageAssets from "../../assets/ImageAssets";

/**
 * @en LeveledSkill
 */
class LeveledSkill {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly level: number;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly simpleDescription: TextAssets;

    readonly _data: JsonObject;

    // The following properties are the same as for Skill

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

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this._data = data;
        this.client = client;

        const json = new JsonManager(this._data);

        this.level = json.getAs<number>("Level");

        this.description = new TextAssets(json.get("SkillDesc", "Hash").getAs<number>(), this.client);
        this.simpleDescription = new TextAssets(json.get("SimpleSkillDesc", "Hash").getAs<number>(), this.client);

        // The following properties are the same as for Skill
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
}

export default LeveledSkill;