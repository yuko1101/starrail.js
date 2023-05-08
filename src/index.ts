import CachedAssetsManager from "./client/CachedAssetsManager";
import ObjectKeysManager from "./client/ObjectKeysManager";
import StarRail from "./client/StarRail";
import AssetsNotFoundError from "./errors/AssetsNotFoundError";
import ImageAssets from "./models/assets/ImageAssets";
import TextAssets from "./models/assets/TextAssets";
import LeveledSkill from "./models/character/skill/LeveledSkill";
import Skill from "./models/character/skill/Skill";
import CharacterData from "./models/character/CharacterData";
import LightConeData from "./models/light_cone/LightConeData";
import LightConeExpType from "./models/light_cone/LightConeExpType";
import LightConeSuperimposition from "./models/light_cone/LightConeSuperimposition";
import CombatType from "./models/CombatType";
import Path from "./models/Path";

// classes
export {
    CachedAssetsManager,
    ObjectKeysManager,
    StarRail,
    AssetsNotFoundError,
    ImageAssets,
    TextAssets,
    LeveledSkill,
    Skill,
    CharacterData,
    LightConeData,
    LightConeExpType,
    LightConeSuperimposition,
    CombatType,
    Path,
};

// typedefs
export { LanguageCode, LanguageMap, NullableLanguageMap } from "./client/CachedAssetsManager";
export { ClientOptions } from "./client/StarRail";
export { ImageBaseUrl } from "./models/assets/ImageAssets";
export { AttackType, EffectType } from "./models/character/skill/Skill";
export { LightConeLevel } from "./models/light_cone/LightConeExpType";
export { CombatTypeId } from "./models/CombatType";
export { PathId } from "./models/Path";

// functions
export { fetchJSON } from "./utils/axios_utils";