import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { ImageAssets } from "../assets/ImageAssets";
import { TextAssets } from "../assets/TextAssets";
import { getStableHash } from "../../utils/hash_utils";
import { Skill } from "./skill/Skill";
import { excelJsonOptions } from "../../client/CachedAssetsManager";

export class Eidolon {
    readonly id: number;
    readonly client: StarRail;
    readonly rank: number;
    readonly characterId: number;
    readonly enhancedId: number;
    readonly icon: ImageAssets;
    readonly picture: ImageAssets;
    readonly name: TextAssets;
    readonly description: TextAssets;
    readonly skillsLevelUp: Record<string, { skill: Skill, levelUp: number }>;

    readonly _data: JsonObject;

    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = this.client.cachedAssetsManager.getExcelData("AvatarRankConfig", id);
        if (!_data) throw new AssetsNotFoundError("Eidolon", this.id);
        this._data = _data;

        const json = new JsonReader(excelJsonOptions, this._data);

        this.rank = json.getAsNumber("Rank");


        // TODO: better way to get characterId and enhancedId
        const groupId = Math.floor(this.id / 100);
        this.enhancedId = Math.floor(groupId / 10000);
        this.characterId = groupId % 10000;

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);
        this.picture = new ImageAssets(`UI/UI3D/Rank/_dependencies/Textures/${this.characterId}/${this.characterId}_Rank_${this.rank}.png`, this.client);

        this.name = new TextAssets(getStableHash(json.getAsString("Name")), this.client);
        // TODO: replace placeholders with numbers in Param
        this.description = new TextAssets(getStableHash(json.getAsString("Desc")), this.client);

        this.skillsLevelUp = Object.fromEntries(json.get("SkillAddLevelList").mapObject((skillId, levelAdd) => [skillId, { skill: new Skill(Number(skillId), this.client), levelUp: levelAdd.getAsNumber() }]));
    }
}
