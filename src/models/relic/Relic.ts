import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import RelicData from "./RelicData";
import { RelicMainStatData } from "./RelicMainStatGroup";
import { RelicSubStatData } from "./RelicSubStatGroup";
import { StatPropertyValue } from "../StatProperty";


/**
 * @en Relic
 */
class Relic {
    /**  */
    readonly client: StarRail;

    /**  */
    readonly relicData: RelicData;
    /**  */
    readonly level: number;
    /**  */
    readonly mainStat: RelicMainStat;
    /**  */
    readonly subStats: RelicSubStat[];

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;
        this._data = data;

        const json = new JsonReader(this._data);

        this.relicData = new RelicData(json.getAsNumber("tid"), this.client);

        this.level = json.getAsNumberWithDefault(0, "level");

        const mainAffixId = json.getAsNumber("mainAffixId");
        const mainStatData = this.relicData.mainStatGroup.mainStats.find(mainStat => mainStat.id === mainAffixId) as RelicMainStatData;
        this.mainStat = new RelicMainStat(mainStatData, this.level);

        this.subStats = json.get("subAffixList").mapArray((_, subAffix) => {
            const subAffixId = subAffix.getAsNumber("affixId");
            const subStatData = this.relicData.subStatGroup.subStats.find(s => s.id === subAffixId) as RelicSubStatData;
            const count = subAffix.getAsNumber("cnt");
            const steps = subAffix.getAsNumberWithDefault(0, "step");

            return new RelicSubStat(subStatData, count, steps);
        });

    }
}

export default Relic;

export class RelicMainStat extends StatPropertyValue {
    /**  */
    readonly mainStatData: RelicMainStatData;
    /** Relic's level */
    readonly level: number;
    /** Calculated by [baseValue](RelicMainStatData#baseValue) + [levelValue](RelicMainStatData#levelValue) \* [level](Relic#level) */
    readonly value: number;

    /**
     * @param mainStatData
     * @param level
     */
    constructor(mainStatData: RelicMainStatData, level: number) {
        const value = mainStatData.baseValue + mainStatData.levelValue * level;
        super(mainStatData.statProperty.statPropertyType, value, mainStatData.statProperty.client);

        this.mainStatData = mainStatData;
        this.level = level;

        this.value = value;
    }
}

export class RelicSubStat extends StatPropertyValue {
    /**  */
    readonly subStatData: RelicSubStatData;
    /** The number of times this SubStat has been enhanced */
    readonly count: number;
    /**  */
    readonly steps: number;
    /** Calculated by [baseValue](RelicSubStatData#baseValue) \* `count` + [stepValue](RelicSubStatData#stepValue) \* `steps` */
    readonly value: number;

    /**
     * @param subStatData
     * @param count
     * @param steps
     */
    constructor(subStatData: RelicSubStatData, count: number, steps: number) {
        const value = subStatData.baseValue * count + subStatData.stepValue * steps;
        super(subStatData.statProperty.statPropertyType, value, subStatData.statProperty.client);

        this.subStatData = subStatData;
        this.count = count;
        this.steps = steps;

        this.value = value;
    }
}