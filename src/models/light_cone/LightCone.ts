import { defaultJsonOptions, JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { LightConeData } from "./LightConeData";
import { LightConeSuperimposition } from "./LightConeSuperimposition";
import { StatPropertyValue } from "../StatProperty";

export class LightCone {
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

        const json = new JsonReader(defaultJsonOptions, this._data);

        this.lightConeData = new LightConeData(json.getAsNumber("tid"), this.client);

        this.level = json.getAsNumber("level");
        this.ascension = json.getAsNumberWithDefault(0, "promotion");

        this.superimposition = this.lightConeData.superimpositions[json.getAsNumber("rank") - 1];

        this.basicStats = this.lightConeData.getStatsByLevel(this.ascension, this.level);
        this.extraStats = this.lightConeData.getSuperimpositionStats(this.superimposition.level);


    }

    static builder(): LightConeBuilder {
        return new LightConeBuilder();
    }
}

export class LightConeBuilder {
    data = {} as JsonObject;

    lightConeData: LightConeData | null = null;

    level(level: number): this {
        this.data.level = level;
        return this;
    }

    ascension(ascension: number): this {
        this.data.promotion = ascension;
        return this;
    }

    superimposition(superimposition: number): this {
        this.data.rank = superimposition;
        return this;
    }

    lightCone(lightConeData: LightConeData): this {
        this.data.tid = lightConeData.id;
        return this;
    }

    build(client: StarRail): LightCone {
        return new LightCone(this.data, client);
    }
}
