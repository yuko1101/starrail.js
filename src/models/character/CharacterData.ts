import { JsonManager, JsonObject } from "config_file.js";
import StarRail from "../../client/StarRail";
import AssetsNotFoundError from "../../errors/AssetsNotFoundError";
import TextAssets from "../assets/TextAssets";
import CombatType, { CombatTypeId } from "../CombatType";
import Path, { PathId } from "../Path";
import Skill from "./skill/Skill";

/**
 * @en CharacterData
 */
class CharacterData {
    /**  */
    readonly id: number;
    /**  */
    readonly client: StarRail;
    /**  */
    readonly name: TextAssets;
    /**  */
    readonly fullName: TextAssets;
    /**  */
    readonly description: TextAssets;
    /**  */
    readonly combatType: CombatType;
    /**  */
    readonly path: Path;
    /**  */
    readonly skills: Skill[];

    readonly _data: JsonObject;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;

        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager.getStarRailCacheData("AvatarConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("Character", this.id);
        this._data = _data;

        const json = new JsonManager(this._data, true);

        this.name = new TextAssets(json.get("AvatarName", "Hash").getAs<number>(), this.client);
        this.fullName = new TextAssets(json.get("AvatarFullName", "Hash").getAs<number>(), this.client);

        this.description = new TextAssets(json.get("AvatarDesc", "Hash").getAs<number>(), this.client);

        this.combatType = new CombatType(json.getAs<CombatTypeId>("DamageType"), this.client);

        this.path = new Path(json.getAs<PathId>("AvatarBaseType"), this.client);

        this.skills = json.getAs<number[]>("SkillList").map(skillId => new Skill(skillId, this.client));
    }
}

export default CharacterData;