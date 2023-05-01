import CachedAssetsManager from "./client/CachedAssetsManager";
import ObjectKeysManager from "./client/ObjectKeysManager";
import StarRail from "./client/StarRail";
import AssetsNotFoundError from "./errors/AssetsNotFoundError";
import LeveledSkill from "./models/character/skill/LeveledSkill";
import Skill from "./models/character/skill/Skill";
import CharacterData from "./models/character/CharacterData";
import CombatType from "./models/CombatType";
import Path from "./models/Path";

// classes
export {
    CachedAssetsManager,
    ObjectKeysManager,
    StarRail,
    AssetsNotFoundError,
    LeveledSkill,
    Skill,
    CharacterData,
    CombatType,
    Path,
};

// typedefs
export { LanguageCode, LanguageMap, NullableLanguageMap } from "./client/CachedAssetsManager";
export { ClientOptions } from "./client/StarRail";
export { CombatTypeId } from "./models/CombatType";
export { PathId } from "./models/Path";

// functions
export { fetchJSON } from "./utils/axios_utils";