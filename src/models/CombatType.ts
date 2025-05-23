import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../client/StarRail";
import { AssetsNotFoundError } from "../errors/AssetsNotFoundError";
import { TextAssets } from "./assets/TextAssets";
import { ImageAssets } from "./assets/ImageAssets";
import { excelJsonOptions } from "../client/CachedAssetsManager";

/**
 * CombatTypeId|In-game Name
 * ---|---
 * Physical|Physical
 * Fire|Fire
 * Ice|Ice
 * Thunder|Lightning
 * Wind|Wind
 * Quantum|Quantum
 * Imaginary|Imaginary
 */
export type CombatTypeId = "Physical" | "Fire" | "Ice" | "Thunder" | "Wind" | "Quantum" | "Imaginary";

export class CombatType {
    readonly id: CombatTypeId;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly description: TextAssets;
    readonly color: number;
    /** Not exact as it is an approximate value */
    readonly iconColor: number;
    /** Icon for the CombatType. Also you can use svg files [here](https://cdn.discordapp.com/attachments/885221800882098197/1118292606384873625/hsr.zip). */
    readonly icon: ImageAssets;
    readonly bigIcon: ImageAssets;

    readonly _data: JsonObject;

    constructor(id: CombatTypeId, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("DamageType", this.id);
        if (!_data) throw new AssetsNotFoundError("CombatType", this.id);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.name = new TextAssets(json.getAsNumberOrBigint("DamageTypeName", "Hash"), this.client);
        this.description = new TextAssets(json.getAsNumberOrBigint("DamageTypeIntro", "Hash"), this.client);

        this.color = parseInt(json.getAsString("Color").replace(/^#/, ""), 16);

        this.iconColor = combatTypeIconColors[this.id];

        this.icon = new ImageAssets(json.getAsString("DamageTypeIconPath"), this.client);
        // use MazeEnterBattleWeakIconPath instead of DamageTypeIconPath as the former is bigger
        this.bigIcon = new ImageAssets(json.getAsString("MazeEnterBattleWeakIconPath"), this.client);

    }
}

export const combatTypeIconColors: Record<CombatTypeId, number> = {
    Physical: 0xCFCFCF,
    Fire: 0xEE4639,
    Ice: 0x4CABDE,
    Thunder: 0xC65EE2,
    Wind: 0x5FCC97,
    Quantum: 0x6A65CC,
    Imaginary: 0xFAE762,
} as const;