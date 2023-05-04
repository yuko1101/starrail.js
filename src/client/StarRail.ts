import { bindOptions } from "config_file.js";
import CachedAssetsManager, { LanguageCode } from "./CachedAssetsManager";
import CharacterData from "../models/character/CharacterData";
import { ImageBaseUrl } from "../models/assets/ImageAssets";
import LightConeData from "../models/light_cone/LightConeData";

const defaultImageBaseUrls: ImageBaseUrl[] = [];

/** @typedef */
export interface ClientOptions {
    userAgent: string,
    cacheDirectory: string | null,
    showFetchCacheLog: boolean,
    timeout: number,
    defaultLanguage: LanguageCode,
    imageBaseUrls: ImageBaseUrl[],
}

/**
 * @en StarRail
 */
class StarRail {
    /** The options the client was instantiated with */
    readonly options: ClientOptions;

    /**  */
    readonly cachedAssetsManager: CachedAssetsManager;

    /**
     * @param options
     */
    constructor(options: Partial<ClientOptions>) {
        this.options = bindOptions({
            userAgent: "Mozilla/5.0",
            cacheDirectory: null,
            showFetchCacheLog: true,
            timeout: 3000,
            defaultLanguage: "en",
            imageBaseUrls: [...defaultImageBaseUrls],
        }, options) as unknown as ClientOptions;

        this.cachedAssetsManager = new CachedAssetsManager(this);
    }

    /**
     * @param playableOnly
     */
    getAllCharacters(playableOnly = true): CharacterData[] {
        return Object.values(this.cachedAssetsManager.getStarRailCacheData("AvatarConfig")).filter(c => (playableOnly && c.AdventurePlayerID === c.AvatarID) || !playableOnly).map(c => new CharacterData(c.AvatarID as number, this));
    }

    /**
     * @param excludeTestLightCones
     */
    getAllLightCones(excludeTestLightCones = true): LightConeData[] {
        return Object.values(this.cachedAssetsManager.getStarRailCacheData("EquipmentConfig")).filter(l => (excludeTestLightCones && l.AvatarBaseType) || !excludeTestLightCones).map(l => new LightConeData(l.EquipmentID as number, this));
    }
}

export default StarRail;