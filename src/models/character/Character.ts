import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import CharacterData from "./CharacterData";
import LightCone from "../light_cone/LightCone";

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
    readonly level: number;
    /**  */
    readonly exp: number;
    /**  */
    readonly ascension: number;

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

        this.level = json.getAsNumber("Level");
        this.exp = json.getAsNumber("EXP");
        this.ascension = json.getAsNumber("Promotion");
    }
}

export default Character;