import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import ImageAssets from "../assets/ImageAssets";
import TextAssets from "../assets/TextAssets";
import { getStableHash } from "../../utils/hash_utils";
import Skill from "./skill/Skill";

/**
 * @en Eidolon
 */
class Eidolon {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;
    /**  */
    readonly rank: number;
    /**  */
    readonly icon: ImageAssets;
    /**  */
    readonly picture: ImageAssets;
    /**  */
    readonly name: TextAssets;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly skillsLevelUp: { [skillId: string]: { skill: Skill, levelUp: number } };

    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data: JsonObject | undefined = this.client.cachedAssetsManager.getStarRailCacheData("AvatarRankConfig")[id];
        if (!_data) throw new AssetsNotFoundError("Eidolon", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.rank = json.getAsNumber("Rank");

        this.icon = new ImageAssets(json.getAsString("IconPath"), this.client);

        // TODO: better way to get characterId
        const characterId = Math.floor(this.id / 100);
        // TODO: capitalized image path
        this.picture = new ImageAssets(`UI/UI3D/Rank/_dependencies/Textures/${characterId}/${characterId}_Rank_${this.rank}.png`, this.client);

        this.name = new TextAssets(getStableHash(json.getAsString("Name")), this.client);
        // TODO: replace placeholders with numbers in Param
        this.description = new TextAssets(getStableHash(json.getAsString("Desc")), this.client);

        this.skillsLevelUp = Object.fromEntries(json.get("SkillAddLevelList").mapObject((skillId, levelAdd) => [skillId, { skill: new Skill(Number(skillId), this.client), levelUp: levelAdd.getAsNumber() }]));
    }
}

export default Eidolon;