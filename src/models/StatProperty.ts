import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../client/StarRail";
import { AssetsNotFoundError } from "../errors/AssetsNotFoundError";
import { ImageAssets } from "./assets/ImageAssets";
import { TextAssets } from "./assets/TextAssets";
import { DynamicTextAssets } from "./assets/DynamicTextAssets";

export class StatProperty {
    readonly type: StatPropertyType;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly nameSkillTree: TextAssets;
    readonly nameRelic: TextAssets;
    readonly nameFilter: TextAssets;
    readonly isDisplay: boolean;
    readonly isBattleDisplay: boolean;
    readonly order: number;
    /** Icon for the stat property. Also you can use svg files [here](https://cdn.discordapp.com/attachments/885221800882098197/1118292606384873625/hsr.zip). */
    readonly icon: ImageAssets;
    readonly isPercent: boolean;

    readonly _data: JsonObject;

    constructor(type: StatPropertyType, client: StarRail) {
        this.type = type;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("AvatarPropertyConfig", this.type);
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

    static ALL_DAMAGE_TYPES = ["PhysicalAddedRatio", "FireAddedRatio", "IceAddedRatio", "ThunderAddedRatio", "WindAddedRatio", "QuantumAddedRatio", "ImaginaryAddedRatio"] as const;
}

export class StatPropertyValue {
    readonly client: StarRail;
    readonly type: StatPropertyType | OtherStatPropertyType;
    /** This will be null if type of provided `type` is {@apilink OtherStatPropertyType}. */
    readonly statProperty: StatProperty | null;
    readonly isPercent: boolean;
    readonly value: number;
    /** This will be null if [statProperty](#statProperty) is null. */
    readonly nameSkillTree: DynamicTextAssets | null;

    constructor(type: StatPropertyType | OtherStatPropertyType, value: number, client: StarRail) {
        this.client = client;
        this.type = type;
        this.statProperty = isStatPropertyType(type) ? new StatProperty(type, this.client) : null;
        this.isPercent = isStatPropertyType(type) ? statPropertyTypes[type].isPercent : otherStatPropertyTypes[type].isPercent;
        this.value = value;

        this.nameSkillTree = this.statProperty ? new DynamicTextAssets(this.statProperty.nameSkillTree.id, { paramList: [value] }, this.client) : null;
    }

    public get valueText(): string {
        if (this.isPercent) {
            let valueString = (this.value * 100).toString();
            if (!valueString.includes(".")) valueString += ".0";
            valueString = valueString.slice(0, valueString.indexOf(".") + 2);
            return valueString + "%";
        }
        return Math.floor(this.value).toString();
    }

}

// Object.entries(data).map(l => `|${l[0]}|${l[1]["isPercent"]}|${l[1]["defaultValue"]}|${l[1]["comment"] ?? ""}|`).join("\n");
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
} as const satisfies { [key: string]: { isPercent: boolean, defaultValue: number, comment?: string } };

/**
 * StatPropertyType|isPercent|defaultValue|Comment
 * ---|---|---|---
 * MaxHP|false|0|
 * Attack|false|0|
 * Defence|false|0|
 * Speed|false|0|
 * CriticalChance|true|0|unknown, but used, likely percent
 * CriticalDamage|true|0|unknown, but used, likely percent
 * BreakDamageAddedRatio|true|0|unknown, not used, likely percent
 * BreakDamageAddedRatioBase|true|0|
 * HealRatio|true|0|unknown, not used, likely percent
 * MaxSP|false|0|
 * SPRatio|true|0|unknown, not used, likely percent
 * StatusProbability|true|0|unknown, only used in inventory sort, likely percent
 * StatusResistance|true|0|unknown, only used in inventory sort, likely percent
 * CriticalChanceBase|true|0|
 * CriticalDamageBase|true|0|
 * HealRatioBase|true|0|
 * StanceBreakAddedRatio|true|0|unknown, not used, likely percent
 * SPRatioBase|true|1|
 * StatusProbabilityBase|true|0|
 * StatusResistanceBase|true|0|
 * PhysicalAddedRatio|true|0|
 * PhysicalResistance|true|0|
 * FireAddedRatio|true|0|
 * FireResistance|true|0|
 * IceAddedRatio|true|0|
 * IceResistance|true|0|
 * ThunderAddedRatio|true|0|
 * ThunderResistance|true|0|
 * WindAddedRatio|true|0|
 * WindResistance|true|0|
 * QuantumAddedRatio|true|0|
 * QuantumResistance|true|0|
 * ImaginaryAddedRatio|true|0|
 * ImaginaryResistance|true|0|
 * BaseHP|false|0|
 * HPDelta|false|0|
 * HPAddedRatio|true|0|
 * BaseAttack|false|0|
 * AttackDelta|false|0|
 * AttackAddedRatio|true|0|
 * BaseDefence|false|0|
 * DefenceDelta|false|0|
 * DefenceAddedRatio|true|0|
 * BaseSpeed|false|0|
 * HealTakenRatio|true|0|unknown, not used, likely percent
 * PhysicalResistanceDelta|false|0|unknown, not used, likely flat
 * FireResistanceDelta|false|0|unknown, not used, likely flat
 * IceResistanceDelta|false|0|unknown, not used, likely flat
 * ThunderResistanceDelta|false|0|unknown, not used, likely flat
 * WindResistanceDelta|false|0|unknown, not used, likely flat
 * QuantumResistanceDelta|false|0|unknown, not used, likely flat
 * ImaginaryResistanceDelta|false|0|unknown, not used, likely flat
 * SpeedDelta|false|0|
 */
export type StatPropertyType = keyof typeof statPropertyTypes;

export const otherStatPropertyTypes = {
    "SpeedAddedRatio": { "isPercent": true, "defaultValue": 0 },
} as const satisfies { [key: string]: { isPercent: boolean, defaultValue: number, comment?: string } };

/**
 * StatPropertyTypes which do not exist in AvatarPropertyConfig.json
 *
 * OtherStatPropertyType|isPercent|defaultValue|Comment
 * ---|---|---|---
 * SpeedAddedRatio|true|0|
 */
export type OtherStatPropertyType = keyof typeof otherStatPropertyTypes;

export function isStatPropertyType(type: StatPropertyType | OtherStatPropertyType): type is StatPropertyType {
    return type != "SpeedAddedRatio";
}