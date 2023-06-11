import { separateByValue } from "config_file.js";
import { OtherStatPropertyType, StatPropertyType, StatPropertyValue, isStatPropertyType, otherStatPropertyTypes, statPropertyTypes } from "../StatProperty";
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

        const characterStats = Object.fromEntries(characterStatProperties.map(stat => [stat.type, stat]));
        this.characterStats = new StatList(characterStats, client);

        const skillTreeNodesStats = sumStats(skillTreeNodesStatProperties, client);
        this.skillTreeNodesStats = new StatList(skillTreeNodesStats, client);

        const overallStats = sumStats([relicsStatProperties, relicSetsStatProperties, lightConeStatProperties, characterStatProperties, skillTreeNodesStatProperties].flat(), client);
        this.overallStats = new OverallStatList(overallStats, client);
    }
}

export default CharacterStats;

/**
 * @en StatList
 */
export class StatList {
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

    public get critRate(): StatPropertyValue {
        return this.getByType("CriticalChanceBase");
    }

    public get critDamage(): StatPropertyValue {
        return this.getByType("CriticalDamageBase");
    }

    public get breakEffect(): StatPropertyValue {
        return this.getByType("BreakDamageAddedRatioBase");
    }

    public get outgoingHealingBoost(): StatPropertyValue {
        return this.getByType("HealRatioBase");
    }

    public get maxEnergy(): StatPropertyValue {
        return this.getByType("MaxSP");
    }

    public get energyRegenRate(): StatPropertyValue {
        return this.getByType("SPRatioBase");
    }

    public get effectHitRate(): StatPropertyValue {
        return this.getByType("StatusProbabilityBase");
    }

    public get effectResistance(): StatPropertyValue {
        return this.getByType("StatusResistanceBase");
    }

    getByType(type: StatPropertyType | OtherStatPropertyType): StatPropertyValue {
        const defaultValue = isStatPropertyType(type) ? statPropertyTypes[type].defaultValue : otherStatPropertyTypes[type].defaultValue;
        return this.list[type] ?? new StatPropertyValue(type, defaultValue, this.client);
    }

    getAll(): StatPropertyValue[] {
        return Object.values(this.list);
    }
}

/**
 * @en OverallStatList
 * @extends {StatList}
 */
export class OverallStatList extends StatList {
    /**
     * @param list
     * @param client
     */
    constructor(list: { [key: string]: StatPropertyValue }, client: StarRail) {
        super(list, client);
    }

    /**  */
    public get maxHP(): StatPropertyValue {
        return new StatPropertyValue("MaxHP", this.getByType("BaseHP").value * (1 + this.getByType("HPAddedRatio").value) + this.getByType("HPDelta").value, this.client);
    }

    /**  */
    public get defense(): StatPropertyValue {
        return new StatPropertyValue("Defence", this.getByType("BaseDefence").value * (1 + this.getByType("DefenceAddedRatio").value) + this.getByType("DefenceDelta").value, this.client);
    }

    /**  */
    public get attack(): StatPropertyValue {
        return new StatPropertyValue("Attack", this.getByType("BaseAttack").value * (1 + this.getByType("AttackAddedRatio").value) + this.getByType("AttackDelta").value, this.client);
    }

    /**  */
    public get speed(): StatPropertyValue {
        return new StatPropertyValue("Speed", this.getByType("BaseSpeed").value * (1 + this.getByType("SpeedAddedRatio").value) + this.getByType("SpeedDelta").value, this.client);
    }

}

/**
 * @param stats
 * @param client
 * @returns
 */
export function sumStats(stats: StatPropertyValue[], client: StarRail): { [key: string]: StatPropertyValue } {
    return Object.fromEntries(
        Object.entries(separateByValue(stats, stat => stat.type))
            .map(([type, list]) => [type, list.reduce((a, b) => new StatPropertyValue(a.type, a.value + b.value, client))]),
    );
}