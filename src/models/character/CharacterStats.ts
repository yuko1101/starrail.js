import { separateByValue } from "config_file.js";
import { StatPropertyType, StatPropertyValue } from "../StatProperty";
import Character from "./Character";
import StarRail from "../../client/StarRail";
import RelicSet from "../relic/RelicSet";

/**
 * @en CharacterStats
 */
class CharacterStats {
    /**  */
    readonly relicsStats: StatList;
    /**  */
    readonly relicSetsStats: StatList;
    /**  */
    readonly lightConeStats: StatList;
    /**  */
    readonly characterStats: StatList;
    /**  */
    readonly skillTreeNodesStats: StatList;
    /**  */
    readonly overallStats: StatList;

    /**
     * @param character
     */
    constructor(character: Character) {
        const client = character.client;

        const relicsStatProperties: StatPropertyValue[] = character.relics.flatMap(r => [new StatPropertyValue(r.mainStat.mainStatData.statProperty.statPropertyType, r.mainStat.value, client), ...r.subStats.map(s => new StatPropertyValue(s.subStatData.statProperty.statPropertyType, s.value, client))]);
        const relicSetsStatProperties: StatPropertyValue[] = RelicSet.getActiveSetBonus(character.relics).flatMap(set => set.activeBonus).flatMap(bonus => bonus.stats);
        const lightConeStatProperties: StatPropertyValue[] = [...(character.lightCone?.basicStats ?? []), ...(character.lightCone?.extraStats ?? [])];
        const characterStatProperties: StatPropertyValue[] = character.basicStats;
        const skillTreeNodesStatProperties: StatPropertyValue[] = character.skills.flatMap(node => node.stats);

        const relicsStats = sumStats(relicsStatProperties, client);
        this.relicsStats = new StatList(relicsStats, client);

        const relicSetsStats = sumStats(relicSetsStatProperties, client);
        this.relicSetsStats = new StatList(relicSetsStats, client);

        const lightConeStats = sumStats(lightConeStatProperties, client);
        this.lightConeStats = new StatList(lightConeStats, client);

        const characterStats = Object.fromEntries(characterStatProperties.map(stat => [stat.statProperty.statPropertyType, stat]));
        this.characterStats = new StatList(characterStats, client);

        const skillTreeNodesStats = sumStats(skillTreeNodesStatProperties, client);
        this.skillTreeNodesStats = new StatList(skillTreeNodesStats, client);

        const overallStats = sumStats([relicsStatProperties, relicSetsStatProperties, lightConeStatProperties, characterStatProperties, skillTreeNodesStatProperties].flat(), client);
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
        return this.list[type] ?? new StatPropertyValue(type, 0, this.client);
    }

    getAll(): StatPropertyValue[] {
        return Object.values(this.list);
    }
}

/**
 * @param stats
 * @param client
 * @returns
 */
function sumStats(stats: StatPropertyValue[], client: StarRail): { [key: string]: StatPropertyValue } {
    return Object.fromEntries(
        Object.entries(separateByValue(stats, stat => stat.statProperty.statPropertyType))
            .map(([type, list]) => [type, list.reduce((a, b) => new StatPropertyValue(a.statProperty.statPropertyType, a.value + b.value, client))]),
    );
}

export { StatList, sumStats };