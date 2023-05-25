import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import CharacterData from "./CharacterData";
import LightCone from "../light_cone/LightCone";
import Relic from "../relic/Relic";

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

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;
        this._data = data;

        const json = new JsonReader(this._data);

        this.characterData = new CharacterData(json.getAsNumber("AvatarID"), this.client);

        this.lightCone = json.has("EquipmentID", "ID") ? new LightCone(json.getAsJsonObject("EquipmentID"), this.client) : null;
        this.relics = json.getAsJsonArrayWithDefault([], "RelicList").map(relic => new Relic(relic as JsonObject, this.client));

        this.level = json.getAsNumber("Level");
        this.exp = json.getAsNumberWithDefault(0, "EXP");
        this.ascension = json.getAsNumberWithDefault(0, "Promotion");
        this.eidolons = json.getAsNumberWithDefault(0, "Rank");
    }
}

export default Character;