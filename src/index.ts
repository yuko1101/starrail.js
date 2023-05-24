import CachedAssetsManager from "./client/CachedAssetsManager";
import ObjectKeysManager from "./client/ObjectKeysManager";
import StarRail from "./client/StarRail";
import AssetsNotFoundError from "./errors/AssetsNotFoundError";
import RequestError from "./errors/RequestError";
import ImageAssets from "./models/assets/ImageAssets";
import TextAssets from "./models/assets/TextAssets";
import LeveledSkill from "./models/character/skill/LeveledSkill";
import Skill from "./models/character/skill/Skill";
import CharacterData from "./models/character/CharacterData";
import LightConeData from "./models/light_cone/LightConeData";
import LightConeExpType from "./models/light_cone/LightConeExpType";
import LightConeSuperimposition from "./models/light_cone/LightConeSuperimposition";
import RelicData from "./models/relic/RelicData";
import RelicExpType from "./models/relic/RelicExpType";
import RelicMainStatGroup from "./models/relic/RelicMainStatGroup";
import RelicSet from "./models/relic/RelicSet";
import RelicSetBonus from "./models/relic/RelicSetBonus";
import RelicSubStatGroup from "./models/relic/RelicSubStatGroup";
import CombatType from "./models/CombatType";
import Path from "./models/Path";
import StatProperty from "./models/StatProperty";
import User from "./models/User";

// classes
export {
    CachedAssetsManager,
    ObjectKeysManager,
    StarRail,
    AssetsNotFoundError,
    RequestError,
    ImageAssets,
    TextAssets,
    LeveledSkill,
    Skill,
    CharacterData,
    LightConeData,
    LightConeExpType,
    LightConeSuperimposition,
    RelicData,
    RelicExpType,
    RelicMainStatGroup,
    RelicSet,
    RelicSetBonus,
    RelicSubStatGroup,
    CombatType,
    Path,
    StatProperty,
    User,
};

// typedefs
export { LanguageCode, LanguageMap, NullableLanguageMap } from "./client/CachedAssetsManager";
export { ClientOptions } from "./client/StarRail";
export { ImageBaseUrl } from "./models/assets/ImageAssets";
export { AttackType, EffectType } from "./models/character/skill/Skill";
export { LightConeLevel } from "./models/light_cone/LightConeExpType";
export { RelicType } from "./models/relic/RelicData";
export { RelicLevel } from "./models/relic/RelicExpType";
export { RelicMainStat } from "./models/relic/RelicMainStatGroup";
export { RelicSubStat } from "./models/relic/RelicSubStatGroup";
export { CombatTypeId } from "./models/CombatType";
export { PathId } from "./models/Path";
export { StatPropertyType } from "./models/StatProperty";
export { Birthday } from "./models/User";

// functions
export { fetchJSON } from "./utils/axios_utils";