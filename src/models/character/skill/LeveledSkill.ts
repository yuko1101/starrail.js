import { JsonManager, JsonObject } from "config_file.js";
import StarRail from "../../../client/StarRail";
import TextAssets from "../../assets/TextAssets";

/**
 * @en LeveledSkill
 */
class LeveledSkill {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly level: number;
    /**  */
    readonly maxLevel: number;
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
        this._data = data;
        this.client = client;

        const json = new JsonManager(this._data);

        this.level = json.getAs<number>("Level");
        this.maxLevel = json.getAs<number>("MaxLevel");

        this.description = new TextAssets(json.get("SkillDesc", "Hash").getAs<number>(), this.client);
        this.simpleDescription = new TextAssets(json.get("SimpleSkillDesc", "Hash").getAs<number>(), this.client);
    }
}

export default LeveledSkill;