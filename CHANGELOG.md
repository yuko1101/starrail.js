# 0.5.0
**This version includes Breaking Changes**
- Renamed Character#skills to skillTreeNodes.
- Added Character#skills whose type is LeveledSkill[].
Changed type of LeveledSkill#level to SkillLevel.
- Changed type of User#icon to UserIcon.
- Removed User#iconCharacter. (Use `User#icon.characterData` instead.)
- Renamed AttackType to SkillType and added "Talent".
- Renamed Skill#attackType to skillType and make non-nullable.
- Renamed Skill#skillTypeDescription to skillTypeText.
- Renamed Skill#tag to effectTypeText.
# 0.4.3
- Added SkillTreeNode#previousNodeIds and SkillTreeNode#getPreviousNodes().
- Made LeveledSkillTreeNode extend SkillTreeNode.
- Made LeveledSkill extend Skill.
# 0.4.2
- Renamed StatProperty#statPropertyType to StatProperty#type.
- Renamed typedef RelicType to RelicTypeId, and added RelicType class.
- Changed type of RelicData#type to RelicType (class).
# 0.4.1
- Changed type of CharacterStats#overallStats to OverlayStatList. (forgot updating)
# 0.4.0
- Changed type of Relic#mainStat to RelicMainStat which contains the value.
- Added LightConeSuperimposition#stats.
- Added LightConeData#getStatsByLevel() and LightConeData#getSuperimpositionStats().
- Added LightCone#basicStats and LightCone#extraStats.
- Changed some stat-related typedefs into classes.
- Renamed LeveledSkillTreeNode#addStats to LeveledSkillTreeNode#stats.
- Added RelicSetBonus#description.
- Added StatProperty#isPercent.
- Added StatPropertyValue#valueText (getter).
- Added Character#basicStats and Character#stats.
# 0.3.4
- Fixed a error with _downloadCacheZip().
# 0.3.3
- Fixed errors with light cone promotion.
- Fixed error handling with mihomo api.
# 0.3.2
- Support HSR v1.1 data structure in mihomo api.
- Removed User#birthday because it cannot be retrieved anymore.
# 0.3.1
- Added CharacterData#eidolons and Eidolon class.
- Added CharacterData#skillTreeNodes.
- Throws MihomoError if an error occurs when requesting with StarRail#fetchUser.
# 0.3.0
- Added StarRail#fetchUser.
- Renamed RelicSubStat to RelicSubStatData.
- Renamed RelicMainStat to RelicMainStat.
# 0.2.1
- Use adm-zip library instead of unzipper.
# 0.2.0
- Added CharacterData#stars and LightConeData#stars.
- Added LightConeData#superimpositions.
- Added relic structures and StarRail#getAllRelics.
# 0.1.0
- Released the first version.