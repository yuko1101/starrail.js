import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../../client/StarRail";
import TextAssets from "../../assets/TextAssets";
import Skill from "./Skill";

/**
 * @en LeveledSkill
 * @extends {Skill}
 */
class LeveledSkill extends Skill {
    /**  */
    readonly level: number;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly simpleDescription: TextAssets;

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        const json = new JsonReader(data);
        const id = json.getAsNumber("SkillID");
        const level = json.getAsNumber("Level");
        super(id, client, level - 1);

        this._data = data;

        this.level = level;

        this.description = new TextAssets(json.getAsNumber("SkillDesc", "Hash"), this.client);
        this.simpleDescription = new TextAssets(json.getAsNumber("SimpleSkillDesc", "Hash"), this.client);
    }
}

export default LeveledSkill;