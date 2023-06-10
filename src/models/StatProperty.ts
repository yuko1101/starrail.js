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
    }

    static ALL_DAMAGE_TYPES: StatPropertyType[] = ["PhysicalAddedRatio", "FireAddedRatio", "IceAddedRatio", "ThunderAddedRatio", "WindAddedRatio", "QuantumAddedRatio", "ImaginaryAddedRatio"];
}

export default StatProperty;

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