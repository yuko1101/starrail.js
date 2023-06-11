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

        this.isPercent = statPropertyTypes[this.statPropertyType].isPercent;
    }

    static ALL_DAMAGE_TYPES: StatPropertyType[] = ["PhysicalAddedRatio", "FireAddedRatio", "IceAddedRatio", "ThunderAddedRatio", "WindAddedRatio", "QuantumAddedRatio", "ImaginaryAddedRatio"];
}

export default StatProperty;

export class StatPropertyValue {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly type: StatPropertyType | OtherStatPropertyType;
    /** This will be null if type of provided `statPropertyType` is [OtherStatPropertyType](OtherStatPropertyType) */
    readonly statProperty: StatProperty | null;
    /**  */
    readonly isPercent: boolean;
    /**  */
    readonly value: number;

    /**
     * @param statPropertyType
     * @param value
     * @param client
     */
    constructor(statPropertyType: StatPropertyType | OtherStatPropertyType, value: number, client: StarRail) {
        this.client = client;
        this.type = statPropertyType;
        this.statProperty = isStatPropertyType(statPropertyType) ? new StatProperty(statPropertyType, this.client) : null;
        this.isPercent = isStatPropertyType(statPropertyType) ? statPropertyTypes[statPropertyType].isPercent : otherStatPropertyTypes[statPropertyType].isPercent;
        this.value = value;
    }

    /**  */
    public get valueText(): string {
        if (this.isPercent) return (this.value * 100).toFixed(1) + "%";
        return this.value.toFixed(0);
    }

}

export const statPropertyTypes = {
    "MaxHP": { "isPercent": false, "defaultValue": 0 },
    "Attack": { "isPercent": false, "defaultValue": 0 },
    "Defence": { "isPercent": false, "defaultValue": 0 },
    "Speed": { "isPercent": false, "defaultValue": 0 },
    "CriticalChance": { "isPercent": true, "defaultValue": 0, "comment": "unknown, but used, likely percent" },
    "CriticalDamage": { "isPercent": true, "defaultValue": 0, "comment": "unknown, but used, likely percent" },
    "BreakDamageAddedRatio": { "isPercent": true, "defaultValue": 0, "comment": "unknown, not used, likely percent" },
    "BreakDamageAddedRatioBase": { "isPercent": true, "defaultValue": 0 },
    "HealRatio": { "isPercent": true, "defaultValue": 0, "comment": "unknown, not used, likely percent" },
    "MaxSP": { "isPercent": false, "defaultValue": 0 },
    "SPRatio": { "isPercent": true, "defaultValue": 0, "comment": "unknown, not used, likely percent" },
    "StatusProbability": { "isPercent": true, "defaultValue": 0, "comment": "unknown, only used in inventory sort, likely percent" },
    "StatusResistance": { "isPercent": true, "defaultValue": 0, "comment": "unknown, only used in inventory sort, likely percent" },
    "CriticalChanceBase": { "isPercent": true, "defaultValue": 0 },
    "CriticalDamageBase": { "isPercent": true, "defaultValue": 0 },
    "HealRatioBase": { "isPercent": true, "defaultValue": 0 },
    "StanceBreakAddedRatio": { "isPercent": true, "defaultValue": 0, "comment": "unknown, not used, likely percent" },
    "SPRatioBase": { "isPercent": true, "defaultValue": 1 },
    "StatusProbabilityBase": { "isPercent": true, "defaultValue": 0 },
    "StatusResistanceBase": { "isPercent": true, "defaultValue": 0 },
    "PhysicalAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "PhysicalResistance": { "isPercent": true, "defaultValue": 0 },
    "FireAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "FireResistance": { "isPercent": true, "defaultValue": 0 },
    "IceAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "IceResistance": { "isPercent": true, "defaultValue": 0 },
    "ThunderAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "ThunderResistance": { "isPercent": true, "defaultValue": 0 },
    "WindAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "WindResistance": { "isPercent": true, "defaultValue": 0 },
    "QuantumAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "QuantumResistance": { "isPercent": true, "defaultValue": 0 },
    "ImaginaryAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "ImaginaryResistance": { "isPercent": true, "defaultValue": 0 },
    "BaseHP": { "isPercent": false, "defaultValue": 0 },
    "HPDelta": { "isPercent": false, "defaultValue": 0 },
    "HPAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "BaseAttack": { "isPercent": false, "defaultValue": 0 },
    "AttackDelta": { "isPercent": false, "defaultValue": 0 },
    "AttackAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "BaseDefence": { "isPercent": false, "defaultValue": 0 },
    "DefenceDelta": { "isPercent": false, "defaultValue": 0 },
    "DefenceAddedRatio": { "isPercent": true, "defaultValue": 0 },
    "BaseSpeed": { "isPercent": false, "defaultValue": 0 },
    "HealTakenRatio": { "isPercent": true, "defaultValue": 0, "comment": "unknown, not used, likely percent" },
    "PhysicalResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "FireResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "IceResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "ThunderResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "WindResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "QuantumResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "ImaginaryResistanceDelta": { "isPercent": false, "defaultValue": 0, "comment": "unknown, not used, likely flat" },
    "SpeedDelta": { "isPercent": false, "defaultValue": 0 },
} as const;

/** @typedef */
export type StatPropertyType = keyof typeof statPropertyTypes;

export const otherStatPropertyTypes = {
    "SpeedAddedRatio": { "isPercent": true, "defaultValue": 0 },
} as const;

/**
 * StatPropertyTypes which do not exist in AvatarPropertyConfig.json
 * @typedef
 */
export type OtherStatPropertyType = keyof typeof otherStatPropertyTypes;

export function isStatPropertyType(type: StatPropertyType | OtherStatPropertyType): type is StatPropertyType {
    return type != "SpeedAddedRatio";
}