# 1.7.0
**This version includes Breaking Changes**
- Renamed StarRailUser#pureFiction to challengeInfo.
- Renamed PureFictionInfo to ChallengeInfo.
- Moved StarRailUser#forgottenHall into the challengeInfo.
# 1.6.0
**This version includes Breaking Changes**
- Added StarRailUser#bookCount, StarRailUser#relicCount, and StarRailUser#musicCount.
- Added StarRailUser#isDisplayAvatar.
- Added StarRailUser#enkaProfile.
- Added StarRailUser#pureFiction.
- Added CharacterData#getBaseAggro(number).
- Renamed StarRailUser#achievements to StarRailUser#achievementCount.
- Changed structure of ForgottenHallInfo.
# 1.5.0
- Added caching for fetching user data by uid (StarRail#fetchUser).
# 1.4.1
- Added Path#smallIcon and CombatType#bigIcon.
- Added ImageAssets#nextSource().
- Added some CDN urls.
# 1.4.0
**This version includes Breaking Changes**
- Renamed StarRailUser#supportCharacter to supportCharacters and its type to Character[].
- Added TextUtils to make it easier to modify formatted texts.
- Fixed some invalid files in assets.
# 1.3.0
**This version includes Breaking Changes**
- Removed StarRailUser#playStationAccount.
- Fixed parsing error with StarRailUser#platform for HSR v1.6.
- Renamed CharacterData#getSkillTreeMap to getSkillTreeIdMap.
- Added CharacterData#getSkillTreeMap and CharacterData#getGroupedSkillTreeNodes methods.
- Renamed UserIcon#icon to itemIcon, and added UserIcon#icon.
- Fixed most of image urls.
# 1.2.0
**This version includes Breaking Changes**
- Renamed ClientOptions#timeout to ClientOptions#requestTimeout.
- Fixed AxiosError was occurred instead of EnkaNetworkError.
- Fixed playstation info for enka.network.
- Changed "PS" in Platform type to "PS5".
# 1.1.1
- Updated image cdns.
# 1.1.0
**This version includes Breaking Changes**
- Changed type of StarRailUser#forgottenHall to ForgottenHallInfo.
- Fixed a error with parsing relic with no sub stats.
# 1.0.2
- Updated image cdns.
- Added Eidolon#picture, CombatType#icon, and Path#icon.
- Added "PS" to type of StarRailUser#platform.
- Added StarRailUser#playStationAccount.
# 1.0.1
- Added StarRailCharacterBuild#imageUrl.
- Removed SkillTreeNode#previousNodeIds, please use SkillTreeNode#previousNodeId instead.
- Added CharacterData#getSkillTreeMap().
- Fixed a error with parsing uid of StarRailUser which was from EnkaGameAccount.
# 1.0.0
**This version includes Breaking Changes**
- Fully supports Enka.Network API.
- Renamed User to StarRailUser.
- Added User#getCharacters().
- Added User#enkaUserHash.
- Added ClientOptions#enkaSystem.
- Added StarRail#fetchEnkaStarRailAccounts(), StarRail#fetchEnkaStarRailAccount(), and StarRail#fetchEnkaStarRailBuilds().
# 0.7.6
- Added ClientOptions#apiBaseUrl for custom api base url such as `https://enka.network/api/hsr/uid`.
# 0.7.5
- Updated npm scripts to make it easier to move cache directory.
# 0.7.4
- Fixed a problem with parsing skills beyond their max level due to the addition of extra levels.
# 0.7.3
- Added ClientOptions#githubToken for less rate-limited requests to github rest api.
# 0.7.2
- Fixed TextMapCN.json cannot be fetched after Honkai: Star Rail v1.2.
# 0.7.1
- Added enka.network cdn to default cdns.
- Fixed ImageAssets#url was incorrect.
# 0.7.0
- Added integration with [enka-network-api](https://github.com/yuko1101/enka-network-api).
    - Supported StarRail EnkaUser.
    - StarRail character builds (including saved builds in Enka.Network).
- Fixed that StatProperty#valueText was not rounded down.
- Made User#supportCharacter nullable.
# 0.6.1
- Added User#platform.
- Made DynamicTextAssets#dynamicData readonly.
- Added DynamicTextAssets#getReplaceData() and DynamicTextAssets#getNullableReplacedData().
# 0.6.0
- Created DynamicTextAssets class for TextAssets which has placeholders.
- Added LeveledSkill#paramList and LeveledSkill#simpleParamList.
- Added LeveledSkillTreeNode#paramList.
- Added LeveledSkillTreeNode#description.
- Fixed the levels of the nodes in Character#skillNodes was incorrect.
- Changed type of LeveledSkillTreeNode#level to SkillLevel.
- Added StatPropertyValue#nameSkillTree.
# 0.5.0
**This version includes Breaking Changes**
- Renamed Character#skills to skillTreeNodes.
- Added Character#skills whose type is LeveledSkill[].
- Changed type of LeveledSkill#level to SkillLevel.
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