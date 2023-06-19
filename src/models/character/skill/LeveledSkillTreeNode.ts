import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../../client/StarRail";
import { StatPropertyType, StatPropertyValue } from "../../StatProperty";
import SkillTreeNode from "./SkillTreeNode";

/**
 * @en LeveledSkillTreeNode
 * @extends {SkillTreeNode}
 */
class LeveledSkillTreeNode extends SkillTreeNode {
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
        super(id, client);

        this._data = data;

        this.level = json.getAsNumber("Level");
        this.characterId = json.getAsNumber("AvatarID");

        this.stats = json.get("StatusAddList").mapArray((_, s) => new StatPropertyValue(s.getAsString("PropertyType") as StatPropertyType, s.getAsNumber("Value", "Value"), this.client));
    }
}

export default LeveledSkillTreeNode;