import { separateByValue } from "config_file.js";
import StatProperty, { StatPropertyType, StatPropertyValue } from "../StatProperty";
import Character from "./Character";
import StarRail from "../../client/StarRail";

/**
 * @en CharacterStats
 */
class CharacterStats {
    /**  */
    readonly relicsStats: StatList;
    /**  */
    readonly lightConeStats: StatList;
    /**  */
    readonly characterStats: StatList;
    /**  */
    readonly overallStats: StatList;

    /**
     * @param character
     */
    constructor(character: Character) {
        const client = character.client;

        const relicStatProperties: StatPropertyValue[] = character.relics.map(r => [{ statProperty: r.mainStat.mainStatData.statProperty, value: r.mainStat.value }, ...r.subStats.map(s => { return { statProperty: s.subStatData.statProperty, value: s.value }; })]).reduce((a, b) => [...a, ...b]);
        const lightConeStatProperties: StatPropertyValue[] = [...(character.lightCone?.basicStats ?? []), ...(character.lightCone?.extraStats ?? [])];
        const characterStatProperties: StatPropertyValue[] = character.basicStats;

        const relicsStats = sumStats(relicStatProperties);
        this.relicsStats = new StatList(relicsStats, client);

        const lightConeStats = sumStats(lightConeStatProperties);
        this.lightConeStats = new StatList(lightConeStats, client);

        const characterStats = Object.fromEntries(characterStatProperties.map(stat => [stat.statProperty.statPropertyType, stat]));
        this.characterStats = new StatList(characterStats, client);

        const overallStats = sumStats([...relicStatProperties, ...lightConeStatProperties, ...characterStatProperties]);
        this.overallStats = new StatList(overallStats, client);
    }
}

export default CharacterStats;

/**
 * @en StatList
 */
class StatList {
    /**  */
    readonly list: { [key: string]: StatPropertyValue };
    /**  */
    readonly client: StarRail;

    /**
     * @param stats
     * @param client
     */
    constructor(list: { [key: string]: StatPropertyValue }, client: StarRail) {
        this.list = list;
        this.client = client;
    }

    getByType(type: StatPropertyType): StatPropertyValue {
        return this.list[type] ?? { statProperty: new StatProperty(type, this.client), value: 0 };
    }

    getAll(): StatPropertyValue[] {
        return Object.values(this.list);
    }
}

/**
 * @param stats
 * @returns
 */
function sumStats(stats: StatPropertyValue[]): { [key: string]: StatPropertyValue } {
    return Object.fromEntries(
        Object.entries(separateByValue(stats, stat => stat.statProperty.statPropertyType))
            .map(([type, list]) => [type, list.reduce((a, b) => { return { statProperty: a.statProperty, value: a.value + b.value }; })]),
    );
}

export { StatList, sumStats };