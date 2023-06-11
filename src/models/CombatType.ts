import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";
import TextAssets from "./assets/TextAssets";

/**
 * @typedef
 * @example
 * |CombatTypeId|In-game Name|
 * |---|---|
 * |Physical|Physical|
 * |Fire|Fire|
 * |Ice|Ice|
 * |Thunder|Lightning|
 * |Wind|Wind|
 * |Quantum|Quantum|
 * |Imaginary|Imaginary|
 */
export type CombatTypeId = "Physical" | "Fire" | "Ice" | "Thunder" | "Wind" | "Quantum" | "Imaginary";

/**
 * @en CombatType
 */
class CombatType {
    /**  */
    readonly id: CombatTypeId;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly color: number;

    /** Not exact as it is an approximate value */
    readonly iconColor: number;

    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: CombatTypeId, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("DamageType")[this.id];
        if (!_data) throw new AssetsNotFoundError("CombatType", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.name = new TextAssets(json.getAsNumber("DamageTypeName", "Hash"), this.client);
        this.description = new TextAssets(json.getAsNumber("DamageTypeIntro", "Hash"), this.client);

        this.color = parseInt(json.getAsString("Color").replace(/^#/, ""), 16);

        this.iconColor = combatTypeIconColors[this.id];
    }
}

export default CombatType;

/** @constant */
export const combatTypeIconColors: { [key in CombatTypeId]: number } = {
    Physical: 0xCFCFCF,
    Fire: 0xEE4639,
    Ice: 0x4CABDE,
    Thunder: 0xC65EE2,
    Wind: 0x5FCC97,
    Quantum: 0x6A65CC,
    Imaginary: 0xFAE762,
} as const;