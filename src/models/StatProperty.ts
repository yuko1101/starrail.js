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
    readonly type: StatPropertyType;
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
     * @param type
     * @param client
     */
    constructor(type: StatPropertyType, client: StarRail) {
        this.type = type;
        this.client = client;

        const _data = client.cachedAssetsManager.getStarRailCacheData("AvatarPropertyConfig")[this.type];
        if (!_data) throw new AssetsNotFoundError("StatProperty", this.type);
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

        this.isPercent = statPropertyTypes[this.type].isPercent;
    }

    /**  */
    static ALL_DAMAGE_TYPES: StatPropertyType[] = ["PhysicalAddedRatio", "FireAddedRatio", "IceAddedRatio", "ThunderAddedRatio", "WindAddedRatio", "QuantumAddedRatio", "ImaginaryAddedRatio"];
}

export default StatProperty;

export class StatPropertyValue {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly type: StatPropertyType | OtherStatPropertyType;
    /** This will be null if type of provided `type` is [OtherStatPropertyType](OtherStatPropertyType) */
    readonly statProperty: StatProperty | null;
    /**  */
    readonly isPercent: boolean;
    /**  */
    readonly value: number;

    /**
     * @param type
     * @param value
     * @param client
     */
    constructor(type: StatPropertyType | OtherStatPropertyType, value: number, client: StarRail) {
        this.client = client;
        this.type = type;
        this.statProperty = isStatPropertyType(type) ? new StatProperty(type, this.client) : null;
        this.isPercent = isStatPropertyType(type) ? statPropertyTypes[type].isPercent : otherStatPropertyTypes[type].isPercent;
        this.value = value;
    }

    /**  */
    public get valueText(): string {
        if (this.isPercent) return (this.value * 100).toFixed(1) + "%";
        return this.value.toFixed(0);
    }

}

// Object.entries(data).map(l => `|${l[0]}|${l[1]["isPercent"]}|${l[1]["defaultValue"]}|${l[1]["comment"] ?? ""}|`).join("\n");
/** @constant */
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

/**
 * @typedef
 * @example
 * |StatPropertyType|isPercent|defaultValue|Comment|
 * |---|---|---|---|
 * |MaxHP|false|0||
 * |Attack|false|0||
 * |Defence|false|0||
 * |Speed|false|0||
 * |CriticalChance|true|0|unknown, but used, likely percent|
 * |CriticalDamage|true|0|unknown, but used, likely percent|
 * |BreakDamageAddedRatio|true|0|unknown, not used, likely percent|
 * |BreakDamageAddedRatioBase|true|0||
 * |HealRatio|true|0|unknown, not used, likely percent|
 * |MaxSP|false|0||
 * |SPRatio|true|0|unknown, not used, likely percent|
 * |StatusProbability|true|0|unknown, only used in inventory sort, likely percent|
 * |StatusResistance|true|0|unknown, only used in inventory sort, likely percent|
 * |CriticalChanceBase|true|0||
 * |CriticalDamageBase|true|0||
 * |HealRatioBase|true|0||
 * |StanceBreakAddedRatio|true|0|unknown, not used, likely percent|
 * |SPRatioBase|true|1||
 * |StatusProbabilityBase|true|0||
 * |StatusResistanceBase|true|0||
 * |PhysicalAddedRatio|true|0||
 * |PhysicalResistance|true|0||
 * |FireAddedRatio|true|0||
 * |FireResistance|true|0||
 * |IceAddedRatio|true|0||
 * |IceResistance|true|0||
 * |ThunderAddedRatio|true|0||
 * |ThunderResistance|true|0||
 * |WindAddedRatio|true|0||
 * |WindResistance|true|0||
 * |QuantumAddedRatio|true|0||
 * |QuantumResistance|true|0||
 * |ImaginaryAddedRatio|true|0||
 * |ImaginaryResistance|true|0||
 * |BaseHP|false|0||
 * |HPDelta|false|0||
 * |HPAddedRatio|true|0||
 * |BaseAttack|false|0||
 * |AttackDelta|false|0||
 * |AttackAddedRatio|true|0||
 * |BaseDefence|false|0||
 * |DefenceDelta|false|0||
 * |DefenceAddedRatio|true|0||
 * |BaseSpeed|false|0||
 * |HealTakenRatio|true|0|unknown, not used, likely percent|
 * |PhysicalResistanceDelta|false|0|unknown, not used, likely flat|
 * |FireResistanceDelta|false|0|unknown, not used, likely flat|
 * |IceResistanceDelta|false|0|unknown, not used, likely flat|
 * |ThunderResistanceDelta|false|0|unknown, not used, likely flat|
 * |WindResistanceDelta|false|0|unknown, not used, likely flat|
 * |QuantumResistanceDelta|false|0|unknown, not used, likely flat|
 * |ImaginaryResistanceDelta|false|0|unknown, not used, likely flat|
 * |SpeedDelta|false|0||
 */
export type StatPropertyType = keyof typeof statPropertyTypes;

/** @constant */
export const otherStatPropertyTypes = {
    "SpeedAddedRatio": { "isPercent": true, "defaultValue": 0 },
} as const;

/**
 * StatPropertyTypes which do not exist in AvatarPropertyConfig.json
 * @typedef
 * @example
 * |OtherStatPropertyType|isPercent|defaultValue|Comment|
 * |---|---|---|---|
 * |SpeedAddedRatio|true|0||
 */
export type OtherStatPropertyType = keyof typeof otherStatPropertyTypes;

/**
 * @param type
 * @returns
 */
export function isStatPropertyType(type: StatPropertyType | OtherStatPropertyType): type is StatPropertyType {
    return type != "SpeedAddedRatio";
}