import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import CharacterData from "./CharacterData";
import LightCone from "../light_cone/LightCone";
import Relic from "../relic/Relic";
import SkillTreeNode, { LeveledSkillTreeNode } from "./skill/SkillTreeNode";
import { StatPropertyValue } from "../StatProperty";
import CharacterStats from "./CharacterStats";

/**
 * @en Character
 */
class Character {
    /**  */
    readonly client: StarRail;

    /**  */
    readonly characterData: CharacterData;
    /**  */
    readonly lightCone: LightCone | null;
    /**  */
    readonly relics: Relic[];
    /**  */
    readonly level: number;
    /**  */
    readonly exp: number;
    /**  */
    readonly ascension: number;
    /**  */
    readonly eidolons: number;
    /**  */
    readonly skills: LeveledSkillTreeNode[];
    /**  */
    readonly basicStats: StatPropertyValue[];
    /**  */
    readonly stats: CharacterStats;

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;
        this._data = data;

        const json = new JsonReader(this._data);

        this.characterData = new CharacterData(json.getAsNumber("avatarId"), this.client);

        this.lightCone = json.has("equipment", "tid") ? new LightCone(json.getAsJsonObject("equipment"), this.client) : null;
        this.relics = json.getAsJsonArrayWithDefault([], "relicList").map(relic => new Relic(relic as JsonObject, this.client));

        this.level = json.getAsNumber("level");
        this.exp = json.getAsNumberWithDefault(0, "exp");
        this.ascension = json.getAsNumberWithDefault(0, "promotion");
        this.eidolons = json.getAsNumberWithDefault(0, "rank");

        this.skills = json.get("skillTreeList").mapArray((_, skill) => new SkillTreeNode(skill.getAsNumber("pointId"), this.client).getSkillTreeNodeByLevel(skill.getAsNumber("level")));

        this.basicStats = [
            ...this.characterData.getStatsByLevel(this.ascension, this.level),
            new StatPropertyValue("SPRatioBase", 1, this.client),
            new StatPropertyValue("MaxSP", this.characterData.maxEnergy, this.client),
        ];

        this.stats = new CharacterStats(this);
    }
}

export default Character;