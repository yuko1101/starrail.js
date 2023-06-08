import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import RelicData from "./RelicData";
import { RelicMainStatData } from "./RelicMainStatGroup";
import { RelicSubStatData } from "./RelicSubStatGroup";

/** @typedef */
export interface RelicSubStat {
    subStatData: RelicSubStatData;
    /** The number of times this SubStat has been enhanced */
    count: number;
    /**  */
    steps: number;
    /** Calculated by [baseValue](RelicSubStatData#baseValue) \* `count` + [stepValue](RelicSubStatData#stepValue) \* `steps` */
    value: number;
}

/** @typedef */
export interface RelicMainStat {
    mainStatData: RelicMainStatData;
    /** Calculated by [baseValue](RelicMainStatData#baseValue) + [levelValue](RelicMainStatData#levelValue) \* [level](Relic#level) */
    value: number;
}

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
        this.mainStat = {
            mainStatData,
            value: mainStatData.baseValue + mainStatData.levelValue * this.level,
        };

        this.subStats = json.get("subAffixList").mapArray((_, subAffix) => {
            const subAffixId = subAffix.getAsNumber("affixId");
            const subStatData = this.relicData.subStatGroup.subStats.find(s => s.id === subAffixId) as RelicSubStatData;
            const count = subAffix.getAsNumber("cnt");
            const steps = subAffix.getAsNumberWithDefault(0, "step");

            return {
                subStatData,
                count,
                steps,
                value: subStatData.baseValue * count + subStatData.stepValue * steps,
            };
        });

    }
}

export default Relic;