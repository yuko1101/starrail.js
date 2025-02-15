import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { RelicData } from "./RelicData";
import { RelicMainStatData } from "./RelicMainStatGroup";
import { RelicSubStatData } from "./RelicSubStatGroup";
import { StatPropertyType, StatPropertyValue } from "../StatProperty";

export class Relic {
    readonly client: StarRail;

    readonly relicData: RelicData;
    readonly level: number;
    readonly mainStat: RelicMainStat;
    readonly subStats: RelicSubStat[];

    readonly _data: JsonObject;

    constructor(data: JsonObject, client: StarRail) {
        this.client = client;
        this._data = data;

        const json = new JsonReader(this._data);

        this.relicData = new RelicData(json.getAsNumber("tid"), this.client);

        this.level = json.getAsNumberWithDefault(0, "level");

        const mainAffixId = json.getAsNumber("mainAffixId");
        const mainStatData = this.relicData.mainStatGroup.mainStats.find(mainStat => mainStat.id === mainAffixId) as RelicMainStatData;
        this.mainStat = new RelicMainStat(mainStatData, this.level);

        this.subStats = json.has("subAffixList") ? json.get("subAffixList").mapArray((_, subAffix) => {
            const subAffixId = subAffix.getAsNumber("affixId");
            const subStatData = this.relicData.subStatGroup.subStats.find(s => s.id === subAffixId) as RelicSubStatData;
            const count = subAffix.getAsNumber("cnt");
            const steps = subAffix.getAsNumberWithDefault(0, "step");

            return new RelicSubStat(subStatData, count, steps);
        }) : [];

    }

    static builder(): RelicBuilder {
        return new RelicBuilder();
    }
}

export class RelicBuilder {
    data = {
        subAffixList: [] as JsonObject[],
    } as JsonObject;

    relicData: RelicData | null = null;

    level(level: number): this {
        this.data.level = level;
        return this;
    }

    relic(relicData: RelicData): this {
        this.data.tid = relicData.id;
        this.relicData = relicData;
        return this;
    }

    mainStat(type: StatPropertyType): this {
        if (!this.relicData) throw new Error("RelicData is not set. Please call `relic` method first.");

        const mainStatData = this.relicData.mainStatGroup.mainStats.find(stat => stat.statProperty.type === type);
        if (!mainStatData) throw new Error(`MainStat with type ${type} is not found.`);

        this.data.mainAffixId = mainStatData.id;
        return this;
    }

    addSubStat(type: StatPropertyType, count: number, steps: number): this {
        if (!this.relicData) throw new Error("RelicData is not set. Please call `relic` method first.");

        const subStatData = this.relicData.subStatGroup.subStats.find(stat => stat.statProperty.type === type);
        if (!subStatData) throw new Error(`SubStat with type ${type} is not found.`);

        (this.data.subAffixList as JsonObject[]).push({
            affixId: subStatData.id,
            cnt: count,
            step: steps,
        });
        return this;
    }

    build(client: StarRail): Relic {
        return new Relic(this.data, client);
    }
}

export class RelicMainStat extends StatPropertyValue {
    readonly mainStatData: RelicMainStatData;
    /** Relic's level */
    readonly level: number;
    /** Calculated by [mainStatData.baseValue](/api/interface/RelicMainStatData#baseValue) + [mainStatData.levelValue](/api/interface/RelicMainStatData#levelValue) \* [level](#level) */
    readonly value: number;

    constructor(mainStatData: RelicMainStatData, level: number) {
        const value = mainStatData.baseValue + mainStatData.levelValue * level;
        super(mainStatData.statProperty.type, value, mainStatData.statProperty.client);

        this.mainStatData = mainStatData;
        this.level = level;

        this.value = value;
    }
}

export class RelicSubStat extends StatPropertyValue {
    readonly subStatData: RelicSubStatData;
    /** The number of times this SubStat has been enhanced */
    readonly count: number;
    readonly steps: number;
    /** Calculated by [subStatData.baseValue](/api/interface/RelicSubStatData#baseValue) \* [count](#count) + [subStatData.stepValue](/api/interface/RelicSubStatData#stepValue) \* [steps](#steps) */
    readonly value: number;

    constructor(subStatData: RelicSubStatData, count: number, steps: number) {
        const value = subStatData.baseValue * count + subStatData.stepValue * steps;
        super(subStatData.statProperty.type, value, subStatData.statProperty.client);

        this.subStatData = subStatData;
        this.count = count;
        this.steps = steps;

        this.value = value;
    }
}