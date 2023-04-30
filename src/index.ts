import CachedAssetsManager from "./client/CachedAssetsManager";
import ObjectKeysManager from "./client/ObjectKeysManager";
import StarRail from "./client/StarRail";

// classes
export {
    CachedAssetsManager,
    ObjectKeysManager,
    StarRail,
};

// typedefs
export { LanguageCode, LanguageMap, NullableLanguageMap } from "./client/CachedAssetsManager";
export { ClientOptions } from "./client/StarRail";

// functions
export { fetchJSON } from "./utils/axios_utils";