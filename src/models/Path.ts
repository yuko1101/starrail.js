import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../client/StarRail";
import { TextAssets } from "./assets/TextAssets";
import { AssetsNotFoundError } from "../errors/AssetsNotFoundError";
import { ImageAssets } from "./assets/ImageAssets";
import { excelJsonOptions } from "../client/CachedAssetsManager";

/**
 * PathId|In-game Name
 * ---|---
 * Warrior|Destruction
 * Rogue|The Hunt
 * Mage|Erudition
 * Shaman|Harmony
 * Warlock|Nihility
 * Knight|Preservation
 * Priest|Abundance
 */
export type PathId = "Warrior" | "Rogue" | "Mage" | "Shaman" | "Warlock" | "Knight" | "Priest" | "Unknown";

export const pathMap = {
    Warrior: "Destruction",
    Rogue: "The Hunt",
    Mage: "Erudition",
    Shaman: "Harmony",
    Warlock: "Nihility",
    Knight: "Preservation",
    Priest: "Abundance",
    Unknown: "General",
} as const satisfies { [path in PathId]: string };

export class Path {
    readonly id: PathId;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly description: TextAssets;
    /** Icon for the Path. Also you can use svg files [here](https://cdn.discordapp.com/attachments/885221800882098197/1118292606384873625/hsr.zip). */
    readonly icon: ImageAssets;
    readonly smallIcon: ImageAssets;

    readonly _data: JsonObject;

    constructor(id: PathId, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("AvatarBaseType", this.id);
        if (!_data) throw new AssetsNotFoundError("Path", this.id);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.name = new TextAssets(json.getAsNumberOrBigint("BaseTypeText", "Hash"), this.client);
        this.description = new TextAssets(json.getAsNumberOrBigint("BaseTypeDesc", "Hash"), this.client);
        this.icon = new ImageAssets(json.getAsString("BaseTypeIcon"), this.client);
        this.smallIcon = new ImageAssets(json.getAsString("BaseTypeIconSmall"), this.client);
    }
}
