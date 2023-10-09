import CachedAssetsManager from "./client/CachedAssetsManager";
import ObjectKeysManager from "./client/ObjectKeysManager";
import StarRail from "./client/StarRail";
import AssetsNotFoundError from "./errors/AssetsNotFoundError";
import DynamicTextAssets from "./models/assets/DynamicTextAssets";
import ImageAssets from "./models/assets/ImageAssets";
import TextAssets from "./models/assets/TextAssets";
import Skill, { LeveledSkill } from "./models/character/skill/Skill";
import SkillLevel from "./models/character/skill/SkillLevel";
import SkillTreeNode, { LeveledSkillTreeNode } from "./models/character/skill/SkillTreeNode";
import Character from "./models/character/Character";
import CharacterData from "./models/character/CharacterData";
import CharacterStats, { StatList, OverallStatList } from "./models/character/CharacterStats";
import Eidolon from "./models/character/Eidolon";
import StarRailCharacterBuild from "./models/enka/StarRailCharacterBuild";
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
import RelicType from "./models/relic/RelicType";
import CombatType from "./models/CombatType";
import Path from "./models/Path";
import StatProperty, { StatPropertyValue } from "./models/StatProperty";
import StarRailUser from "./models/StarRailUser";
import UserIcon from "./models/UserIcon";

// classes
export {
    CachedAssetsManager,
    ObjectKeysManager,
    StarRail,
    AssetsNotFoundError,
    DynamicTextAssets,
    ImageAssets,
    TextAssets,
    Skill,
    LeveledSkill,
    SkillLevel,
    SkillTreeNode,
    LeveledSkillTreeNode,
    Character,
    CharacterData,
    CharacterStats,
    StatList,
    OverallStatList,
    Eidolon,
    StarRailCharacterBuild,
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
    RelicType,
    CombatType,
    Path,
    StatProperty,
    StatPropertyValue,
    StarRailUser,
    UserIcon,
};

// typedefs
export { LanguageCode, LanguageMap, NullableLanguageMap } from "./client/CachedAssetsManager";
export { ClientOptions } from "./client/StarRail";
export { DynamicData } from "./models/assets/DynamicTextAssets";
export { ImageBaseUrl, CustomImageBaseUrl } from "./models/assets/ImageAssets";
export { SkillType, EffectType } from "./models/character/skill/Skill";
export { LightConeLevel } from "./models/light_cone/LightConeExpType";
export { RelicLevel } from "./models/relic/RelicExpType";
export { RelicMainStatData } from "./models/relic/RelicMainStatGroup";
export { RelicSubStatData } from "./models/relic/RelicSubStatGroup";
export { RelicTypeId } from "./models/relic/RelicType";
export { CombatTypeId } from "./models/CombatType";
export { PathId } from "./models/Path";
export { StatPropertyType, OtherStatPropertyType } from "./models/StatProperty";
export { Birthday } from "./models/StarRailUser";

// functions
export { sumStats } from "./models/character/CharacterStats";
export { isStatPropertyType } from "./models/StatProperty";
export { fetchJSON } from "./utils/axios_utils";
export { getStableHash } from "./utils/hash_utils";
export { nonNullable } from "./utils/ts_utils";

// constants
export { combatTypeIconColors } from "./models/CombatType";
export { statPropertyTypes, otherStatPropertyTypes } from "./models/StatProperty";