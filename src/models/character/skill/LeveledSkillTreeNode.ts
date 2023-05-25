import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../../client/StarRail";
import TextAssets from "../../assets/TextAssets";
import Skill from "./Skill";
import { getStableHash } from "../../../utils/hash_utils";
import ImageAssets from "../../assets/ImageAssets";

/**
 * @en LeveledSkillTreeNode
 */
class LeveledSkillTreeNode {
    /**  */
    readonly client: StarRail;

    /**  */
    readonly id: number;
    /**  */
    readonly level: number;
    /**  */
    readonly characterId: number;

    readonly _data: JsonObject;

    // The following properties are the same as for SkillTreeNode

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

    /**
     * @param id
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this._data = data;
        this.client = client;

        const json = new JsonReader(this._data);

        this.id = json.getAsNumber("PointID");
        this.level = json.getAsNumber("Level");
        this.characterId = json.getAsNumber("AvatarID");


        // The following properties are the same as for SkillTreeNode
        this.maxLevel = json.getAsNumber("MaxLevel");
        this.isUnlockedByDefault = json.getAsBooleanWithDefault(false, "DefaultUnlock");

        this.levelUpSkills = json.get("LevelUpSkillID").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        if (this.levelUpSkills.length === 0 && json.getAsString("PointName") === "") throw new Error(`SkillTreeNode must have a name.\nID: ${this.id}, Level: ${(this as unknown as { [s: string]: unknown })["level"] ?? 1}\nIf you encounter this error, please create an issue at https://github.com/yuko1101/starrail.js/issues`);
        this.name = this.levelUpSkills.length > 0 ? this.levelUpSkills[0].name : new TextAssets(getStableHash(json.getAsString("PointName")), this.client);

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);

    }
}

export default LeveledSkillTreeNode;