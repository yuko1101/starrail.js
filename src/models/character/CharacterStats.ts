import { separateByValue } from "config_file.js";
import { OtherStatPropertyType, StatPropertyType, StatPropertyValue, isStatPropertyType, otherStatPropertyTypes, statPropertyTypes } from "../StatProperty";
import { Character } from "./Character";
import { StarRail } from "../../client/StarRail";
import { RelicSet } from "../relic/RelicSet";
import { CombatTypeId } from "../CombatType";

export class CharacterStats {
    readonly relicsStats: StatList;
    readonly relicSetsStats: StatList;
    readonly lightConeStats: StatList;
    readonly characterStats: StatList;
    readonly skillTreeNodesStats: StatList;
    readonly overallStats: OverallStatList;

    constructor(character: Character) {
        const client = character.client;

        const relicsStatProperties: StatPropertyValue[] = character.relics.flatMap(r => [new StatPropertyValue(r.mainStat.mainStatData.statProperty.type, r.mainStat.value, client), ...r.subStats.map(s => new StatPropertyValue(s.subStatData.statProperty.type, s.value, client))]);
        const relicSetsStatProperties: StatPropertyValue[] = RelicSet.getActiveSetBonus(character.relics).flatMap(set => set.activeBonus).flatMap(bonus => bonus.stats);
        const lightConeStatProperties: StatPropertyValue[] = [...(character.lightCone?.basicStats ?? []), ...(character.lightCone?.extraStats ?? [])];
        const characterStatProperties: StatPropertyValue[] = character.basicStats;
        const skillTreeNodesStatProperties: StatPropertyValue[] = character.skillTreeNodes.flatMap(node => node.stats);

        const relicsStats = sumStats(relicsStatProperties, client);
        this.relicsStats = new StatList(relicsStats, character.characterData.combatType.id, client);

        const relicSetsStats = sumStats(relicSetsStatProperties, client);
        this.relicSetsStats = new StatList(relicSetsStats, character.characterData.combatType.id, client);

        const lightConeStats = sumStats(lightConeStatProperties, client);
        this.lightConeStats = new StatList(lightConeStats, character.characterData.combatType.id, client);

        const characterStats = Object.fromEntries(characterStatProperties.map(stat => [stat.type, stat]));
        this.characterStats = new StatList(characterStats, character.characterData.combatType.id, client);

        const skillTreeNodesStats = sumStats(skillTreeNodesStatProperties, client);
        this.skillTreeNodesStats = new StatList(skillTreeNodesStats, character.characterData.combatType.id, client);

        const overallStats = sumStats([relicsStatProperties, relicSetsStatProperties, lightConeStatProperties, characterStatProperties, skillTreeNodesStatProperties].flat(), client);
        this.overallStats = new OverallStatList(overallStats, character.characterData.combatType.id, client);
    }
}

export class StatList {
    readonly list: Record<string, StatPropertyValue>;
    readonly combatTypeId: CombatTypeId;
    readonly client: StarRail;

    constructor(list: Record<string, StatPropertyValue>, combatTypeId: CombatTypeId, client: StarRail) {
        this.list = list;
        this.combatTypeId = combatTypeId;
        this.client = client;
    }

    // Advanced Stats
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

    // DMG Type
    public get physicalDamageBonus(): StatPropertyValue {
        return this.getByType("PhysicalAddedRatio");
    }
    public get fireDamageBonus(): StatPropertyValue {
        return this.getByType("FireAddedRatio");
    }
    public get iceDamageBonus(): StatPropertyValue {
        return this.getByType("IceAddedRatio");
    }
    public get lightningDamageBonus(): StatPropertyValue {
        return this.getByType("ThunderAddedRatio");
    }
    public get windDamageBonus(): StatPropertyValue {
        return this.getByType("WindAddedRatio");
    }
    public get quantumDamageBonus(): StatPropertyValue {
        return this.getByType("QuantumAddedRatio");
    }
    public get imaginaryDamageBonus(): StatPropertyValue {
        return this.getByType("ImaginaryAddedRatio");
    }
    public get physicalResistanceBoost(): StatPropertyValue {
        return this.getByType("PhysicalResistance");
    }
    public get fireResistanceBoost(): StatPropertyValue {
        return this.getByType("FireResistance");
    }
    public get iceResistanceBoost(): StatPropertyValue {
        return this.getByType("IceResistance");
    }
    public get lightningResistanceBoost(): StatPropertyValue {
        return this.getByType("ThunderResistance");
    }
    public get windResistanceBoost(): StatPropertyValue {
        return this.getByType("WindResistance");
    }
    public get quantumResistanceBoost(): StatPropertyValue {
        return this.getByType("QuantumResistance");
    }
    public get imaginaryResistanceBoost(): StatPropertyValue {
        return this.getByType("ImaginaryResistance");
    }

    getByType(type: StatPropertyType | OtherStatPropertyType): StatPropertyValue {
        const defaultValue = isStatPropertyType(type) ? statPropertyTypes[type].defaultValue : otherStatPropertyTypes[type].defaultValue;
        return this.list[type] ?? new StatPropertyValue(type, defaultValue, this.client);
    }

    getAll(): StatPropertyValue[] {
        return Object.values(this.list);
    }

    getMatchedDamageBonus(): StatPropertyValue {
        switch (this.combatTypeId) {
            case "Physical":
                return this.physicalDamageBonus;
            case "Fire":
                return this.fireDamageBonus;
            case "Ice":
                return this.iceDamageBonus;
            case "Thunder":
                return this.lightningDamageBonus;
            case "Wind":
                return this.windDamageBonus;
            case "Quantum":
                return this.quantumDamageBonus;
            case "Imaginary":
                return this.imaginaryDamageBonus;
        }
    }
}

export class OverallStatList extends StatList {
    // Base Stats
    public get maxHP(): StatPropertyValue {
        return new StatPropertyValue("MaxHP", this.getByType("BaseHP").value * (1 + this.getByType("HPAddedRatio").value) + this.getByType("HPDelta").value, this.client);
    }

    public get defense(): StatPropertyValue {
        return new StatPropertyValue("Defence", this.getByType("BaseDefence").value * (1 + this.getByType("DefenceAddedRatio").value) + this.getByType("DefenceDelta").value, this.client);
    }

    public get attack(): StatPropertyValue {
        return new StatPropertyValue("Attack", this.getByType("BaseAttack").value * (1 + this.getByType("AttackAddedRatio").value) + this.getByType("AttackDelta").value, this.client);
    }

    public get speed(): StatPropertyValue {
        return new StatPropertyValue("Speed", this.getByType("BaseSpeed").value * (1 + this.getByType("SpeedAddedRatio").value) + this.getByType("SpeedDelta").value, this.client);
    }

}

export function sumStats(stats: StatPropertyValue[], client: StarRail): Record<string, StatPropertyValue> {
    return Object.fromEntries(
        Object.entries(separateByValue(stats, stat => stat.type))
            .map(([type, list]) => [type, list.reduce((a, b) => new StatPropertyValue(a.type, a.value + b.value, client))]),
    );
}
