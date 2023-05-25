import { JsonObject, JsonReader } from "config_file.js";
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
    readonly id: number;
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

        const json = new JsonReader(this._data);

        this.id = json.getAsNumber("SkillID");

        this.level = json.getAsNumber("Level");

        this.description = new TextAssets(json.getAsNumber("SkillDesc", "Hash"), this.client);
        this.simpleDescription = new TextAssets(json.getAsNumber("SimpleSkillDesc", "Hash"), this.client);

        // The following properties are the same as for Skill
        this.name = new TextAssets(json.getAsNumber("SkillName", "Hash"), this.client);
        this.tag = new TextAssets(json.getAsNumber("SkillTag", "Hash"), this.client);
        this.skillTypeDescription = new TextAssets(json.getAsNumber("SkillTypeDesc", "Hash"), this.client);

        this.attackType = json.getAsStringWithDefault(null, "AttackType") as AttackType | null;
        const combatTypeId = json.getAsStringWithDefault(undefined, "StanceDamageType") as CombatTypeId | undefined;
        this.combatType = combatTypeId ? new CombatType(combatTypeId, this.client) : null;
        this.effectType = json.getAsString("SkillEffect") as EffectType;

        this.maxLevel = json.getAsNumber("MaxLevel");

        this.skillIcon = new ImageAssets(json.getAsString("SkillIcon"), this.client);
        this.ultraSkillIcon = new ImageAssets(json.getAsString("UltraSkillIcon"), this.client);
    }
}

export default LeveledSkill;