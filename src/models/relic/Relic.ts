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
    /** Calculated by [baseValue](RelicSubStatData#baseValue) \* [count](#count) + [stepValue](RelicSubStatData#stepValue) \* [steps](#steps) */
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
    readonly mainStat: RelicMainStatData;
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

        this.relicData = new RelicData(json.getAsNumber("ID"), this.client);

        this.level = json.getAsNumberWithDefault(0, "Level");

        const mainAffixId = json.getAsNumber("MainAffixID");
        this.mainStat = this.relicData.mainStatGroup.mainStats.find(mainStat => mainStat.id === mainAffixId) as RelicMainStatData;

        this.subStats = json.get("RelicSubAffix").mapArray((_, subAffix) => {
            const subAffixId = subAffix.getAsNumber("SubAffixID");
            const subStatData = this.relicData.subStatGroup.subStats.find(s => s.id === subAffixId) as RelicSubStatData;
            const count = subAffix.getAsNumber("Cnt");
            const steps = subAffix.getAsNumberWithDefault(0, "Step");

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