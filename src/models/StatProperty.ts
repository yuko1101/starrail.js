import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";
import ImageAssets from "./assets/ImageAssets";
import TextAssets from "./assets/TextAssets";

/**
 * @en StatProperty
 */
class StatProperty {
    /**  */
    readonly statPropertyType: StatPropertyType;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly nameSkillTree: TextAssets;
    /**  */
    readonly nameRelic: TextAssets;
    /**  */
    readonly nameFilter: TextAssets;
    /**  */
    readonly isDisplay: boolean;
    /**  */
    readonly isBattleDisplay: boolean;
    /**  */
    readonly order: number;
    /**  */
    readonly icon: ImageAssets;
    /**  */
    readonly isPercent: boolean;

    readonly _data: JsonObject;

    /**
     * @param statPropertyType
     * @param client
     */
    constructor(statPropertyType: StatPropertyType, client: StarRail) {
        this.statPropertyType = statPropertyType;
        this.client = client;

        const _data = client.cachedAssetsManager.getStarRailCacheData("AvatarPropertyConfig")[this.statPropertyType];
        if (!_data) throw new AssetsNotFoundError("StatProperty", this.statPropertyType);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.name = new TextAssets(json.getAsNumber("PropertyName", "Hash"), this.client);
        this.nameSkillTree = new TextAssets(json.getAsNumber("PropertyNameSkillTree", "Hash"), this.client);
        this.nameRelic = new TextAssets(json.getAsNumber("PropertyNameRelic", "Hash"), this.client);
        this.nameFilter = new TextAssets(json.getAsNumber("PropertyNameFilter", "Hash"), this.client);

        this.isDisplay = json.getAsBooleanWithDefault(false, "IsDisplay");
        this.isBattleDisplay = json.getAsBooleanWithDefault(false, "isBattleDisplay");

        this.order = json.getAsNumber("Order");

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);

        this.isPercent = percentStatPropertyTypes.includes(this.statPropertyType);
    }

    static ALL_DAMAGE_TYPES: StatPropertyType[] = ["PhysicalAddedRatio", "FireAddedRatio", "IceAddedRatio", "ThunderAddedRatio", "WindAddedRatio", "QuantumAddedRatio", "ImaginaryAddedRatio"];
}

export default StatProperty;

export const percentStatPropertyTypes: StatPropertyType[] = [
    "CriticalChance", // percent
    "CriticalDamage", // percent
    "BreakDamageAddedRatio", // percent
    "BreakDamageAddedRatioBase", // percent
    "HealRatio", // percent
    "SPRatio", // percent
    "StatusProbability", // percent
    "StatusResistance", // percent
    "CriticalChanceBase", // percent
    "CriticalDamageBase", // percent
    "HealRatioBase", // percent
    "StanceBreakAddedRatio", // unknown, not used, likely percent
    "SPRatioBase", // percent
    "StatusProbabilityBase", // percent
    "StatusResistanceBase", // percent
    "PhysicalAddedRatio", // percent
    "PhysicalResistance", // percent
    "FireAddedRatio", // percent
    "FireResistance", // percent
    "IceAddedRatio", // percent
    "IceResistance", // percent
    "ThunderAddedRatio", // percent
    "ThunderResistance", // percent
    "WindAddedRatio", // percent
    "WindResistance", // percent
    "QuantumAddedRatio", // percent
    "QuantumResistance", // percent
    "ImaginaryAddedRatio", // percent
    "ImaginaryResistance", // percent
    "HPAddedRatio", // percent
    "AttackAddedRatio", // percent
    "DefenceAddedRatio", // percent
    "HealTakenRatio", // percent
];

export class StatPropertyValue {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly statProperty: StatProperty;
    /**  */
    readonly value: number;

    /**
     * @param statPropertyType
     * @param value
     * @param client
     */
    constructor(statPropertyType: StatPropertyType, value: number, client: StarRail) {
        this.client = client;
        this.statProperty = new StatProperty(statPropertyType, this.client);
        this.value = value;
    }
}

/** @typedef */
export type StatPropertyType =
    | "MaxHP" // flat
    | "Attack" // flat
    | "Defence" // flat
    | "Speed" // flat
    | "CriticalChance" // percent
    | "CriticalDamage" // percent
    | "BreakDamageAddedRatio" // percent
    | "BreakDamageAddedRatioBase" // percent
    | "HealRatio" // percent
    | "MaxSP" // flat
    | "SPRatio" // percent
    | "StatusProbability" // percent
    | "StatusResistance" // percent
    | "CriticalChanceBase" // percent
    | "CriticalDamageBase" // percent
    | "HealRatioBase" // percent
    | "StanceBreakAddedRatio" // unknown, not used, likely percent
    | "SPRatioBase" // percent
    | "StatusProbabilityBase" // percent
    | "StatusResistanceBase" // percent
    | "PhysicalAddedRatio" // percent
    | "PhysicalResistance" // percent
    | "FireAddedRatio" // percent
    | "FireResistance" // percent
    | "IceAddedRatio" // percent
    | "IceResistance" // percent
    | "ThunderAddedRatio" // percent
    | "ThunderResistance" // percent
    | "WindAddedRatio" // percent
    | "WindResistance" // percent
    | "QuantumAddedRatio" // percent
    | "QuantumResistance" // percent
    | "ImaginaryAddedRatio" // percent
    | "ImaginaryResistance" // percent
    | "BaseHP" // flat
    | "HPDelta" // flat
    | "HPAddedRatio" // percent
    | "BaseAttack" // flat
    | "AttackDelta" // flat
    | "AttackAddedRatio" // percent
    | "BaseDefence" // flat
    | "DefenceDelta" // flat
    | "DefenceAddedRatio" // percent
    | "BaseSpeed" // flat
    | "HealTakenRatio" // percent
    | "PhysicalResistanceDelta" // unknown, not used, likely flat
    | "FireResistanceDelta" // unknown, not used, likely flat
    | "IceResistanceDelta" // unknown, not used, likely flat
    | "ThunderResistanceDelta" // unknown, not used, likely flat
    | "WindResistanceDelta" // unknown, not used, likely flat
    | "QuantumResistanceDelta" // unknown, not used, likely flat
    | "ImaginaryResistanceDelta" // unknown, not used, likely flat
    | "SpeedDelta" // flat
    ;