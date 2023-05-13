import StarRail from "../client/StarRail";

/**
 * @en StatProperty
 */
class StatProperty {
    /**  */
    readonly statPropertyType: StatPropertyType;
    /**  */
    readonly client: StarRail;

    /**
     * @param statPropertyType
     * @param client
     */
    constructor(statPropertyType: StatPropertyType, client: StarRail) {
        this.statPropertyType = statPropertyType;
        this.client = client;
    }
}

export default StatProperty;

/** @typedef */
export type StatPropertyType =
    | "MaxHP"
    | "Attack"
    | "Defence"
    | "Speed"
    | "CriticalChance"
    | "CriticalDamage"
    | "BreakDamageAddedRatio"
    | "BreakDamageAddedRatioBase"
    | "HealRatio"
    | "MaxSP"
    | "SPRatio"
    | "StatusProbability"
    | "StatusResistance"
    | "CriticalChanceBase"
    | "CriticalDamageBase"
    | "HealRatioBase"
    | "StanceBreakAddedRatio"
    | "SPRatioBase"
    | "StatusProbabilityBase"
    | "StatusResistanceBase"
    | "PhysicalAddedRatio"
    | "PhysicalResistance"
    | "FireAddedRatio"
    | "FireResistance"
    | "IceAddedRatio"
    | "IceResistance"
    | "ThunderAddedRatio"
    | "ThunderResistance"
    | "WindAddedRatio"
    | "WindResistance"
    | "QuantumAddedRatio"
    | "QuantumResistance"
    | "ImaginaryAddedRatio"
    | "ImaginaryResistance"
    | "BaseHP"
    | "HPDelta"
    | "HPAddedRatio"
    | "BaseAttack"
    | "AttackDelta"
    | "AttackAddedRatio"
    | "BaseDefence"
    | "DefenceDelta"
    | "DefenceAddedRatio"
    | "BaseSpeed"
    | "HealTakenRatio"
    | "PhysicalResistanceDelta"
    | "FireResistanceDelta"
    | "IceResistanceDelta"
    | "ThunderResistanceDelta"
    | "WindResistanceDelta"
    | "QuantumResistanceDelta"
    | "ImaginaryResistanceDelta"
    | "SpeedDelta";