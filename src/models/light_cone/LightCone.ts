import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import LightConeData from "./LightConeData";
import LightConeSuperimposition from "./LightConeSuperimposition";

/**
 * @en
 */
class LightCone {
    /**  */
    readonly client: StarRail;

    /**  */
    readonly lightConeData: LightConeData;
    /**  */
    readonly level: number;
    /**  */
    readonly ascension: number;
    /**  */
    readonly superimposition: LightConeSuperimposition;

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;
        this._data = data;

        const json = new JsonReader(this._data);

        this.lightConeData = new LightConeData(json.getAsNumber("tid"), this.client);

        this.level = json.getAsNumber("level");
        this.ascension = json.getAsNumberWithDefault(0, "promotion");

        this.superimposition = this.lightConeData.superimpositions[json.getAsNumber("rank") - 1];

    }
}

export default LightCone;