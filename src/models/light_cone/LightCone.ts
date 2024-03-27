import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import LightConeData from "./LightConeData";
import LightConeSuperimposition from "./LightConeSuperimposition";
import { StatPropertyValue } from "../StatProperty";

/**
 * @en
 */
class LightCone {
    readonly client: StarRail;

    readonly lightConeData: LightConeData;
    readonly level: number;
    readonly ascension: number;
    readonly superimposition: LightConeSuperimposition;
    /** BaseHP, BaseAttack, and BaseDefence of this light cone. */
    readonly basicStats: StatPropertyValue[];
    /** Additional stats of this light cone skill */
    readonly extraStats: StatPropertyValue[];

    readonly _data: JsonObject;

    constructor(data: JsonObject, client: StarRail) {
        this.client = client;
        this._data = data;

        const json = new JsonReader(this._data);

        this.lightConeData = new LightConeData(json.getAsNumber("tid"), this.client);

        this.level = json.getAsNumber("level");
        this.ascension = json.getAsNumberWithDefault(0, "promotion");

        this.superimposition = this.lightConeData.superimpositions[json.getAsNumber("rank") - 1];

        this.basicStats = this.lightConeData.getStatsByLevel(this.ascension, this.level);
        this.extraStats = this.lightConeData.getSuperimpositionStats(this.superimposition.level);


    }
}

export default LightCone;