import CachedAssetsManager from "./client/CachedAssetsManager";
import ObjectKeysManager from "./client/ObjectKeysManager";
import StarRail from "./client/StarRail";
import AssetsNotFoundError from "./errors/AssetsNotFoundError";
import InvalidUidFormatError from "./errors/InvalidUidFormatError";
import MihomoError from "./errors/MihomoError";
import RequestError from "./errors/RequestError";
import UserNotFoundError from "./errors/UserNotFoundError";
import ImageAssets from "./models/assets/ImageAssets";
import TextAssets from "./models/assets/TextAssets";
import LeveledSkill from "./models/character/skill/LeveledSkill";
import Skill from "./models/character/skill/Skill";
import Character from "./models/character/Character";
import CharacterData from "./models/character/CharacterData";
import CharacterStats, { StatList } from "./models/character/CharacterStats";
import Eidolon from "./models/character/Eidolon";
import LightCone from "./models/light_cone/LightCone";
import LightConeData from "./models/light_cone/LightConeData";
import LightConeExpType from "./models/light_cone/LightConeExpType";
import LightConeSuperimposition from "./models/light_cone/LightConeSuperimposition";
import Relic, { RelicMainStat, RelicSubStat } from "./models/relic/Relic";
import RelicData from "./models/relic/RelicData";
import RelicExpType from "./models/relic/RelicExpType";
import RelicMainStatGroup from "./models/relic/RelicMainStatGroup";
import RelicSet from "./models/relic/RelicSet";
import RelicSetBonus from "./models/relic/RelicSetBonus";
import RelicSubStatGroup from "./models/relic/RelicSubStatGroup";
import CombatType from "./models/CombatType";
import Path from "./models/Path";
import StatProperty, { StatPropertyValue } from "./models/StatProperty";
import User from "./models/User";

// classes
export {
    CachedAssetsManager,
    ObjectKeysManager,
    StarRail,
    AssetsNotFoundError,
    InvalidUidFormatError,
    MihomoError,
    RequestError,
    UserNotFoundError,
    ImageAssets,
    TextAssets,
    LeveledSkill,
    Skill,
    Character,
    CharacterData,
    CharacterStats,
    StatList,
    Eidolon,
    LightCone,
    LightConeData,
    LightConeExpType,
    LightConeSuperimposition,
    Relic,
    RelicMainStat,
    RelicSubStat,
    RelicData,
    RelicExpType,
    RelicMainStatGroup,
    RelicSet,
    RelicSetBonus,
    RelicSubStatGroup,
    CombatType,
    Path,
    StatProperty,
    StatPropertyValue,
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
export { RelicMainStatData } from "./models/relic/RelicMainStatGroup";
export { RelicSubStatData } from "./models/relic/RelicSubStatGroup";
export { CombatTypeId } from "./models/CombatType";
export { PathId } from "./models/Path";
export { StatPropertyType, OtherStatPropertyType } from "./models/StatProperty";
export { Birthday } from "./models/User";

// functions
export { sumStats } from "./models/character/CharacterStats";
export { isStatPropertyType } from "./models/StatProperty";
export { fetchJSON } from "./utils/axios_utils";
export { getStableHash } from "./utils/hash_utils";

// constants
export { combatTypeIconColors } from "./models/CombatType";
export { percentStatPropertyTypes } from "./models/StatProperty";