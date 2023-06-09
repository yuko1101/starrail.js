# 0.4.0
- Changed type of Relic#mainStat to RelicMainStat which contains the value.
- Added LightConeSuperimposition#stats.
- Added LightConeData#getStatsByLevel() and LightConeData#getSuperimpositionStats().
- Added LightCone#basicStats and LightCone#extraStats.
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