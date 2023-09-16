import { JsonObject, JsonReader, bindOptions } from "config_file.js";
import CachedAssetsManager, { LanguageCode } from "./CachedAssetsManager";
import CharacterData from "../models/character/CharacterData";
import { ImageBaseUrl } from "../models/assets/ImageAssets";
import LightConeData from "../models/light_cone/LightConeData";
import RelicData from "../models/relic/RelicData";
import { fetchJSON } from "../utils/axios_utils";
import RequestError from "../errors/RequestError";
import User from "../models/User";
import InvalidUidFormatError from "../errors/InvalidUidFormatError";
import UserNotFoundError from "../errors/UserNotFoundError";
import APIError from "../errors/APIError";
import StarRailCharacterBuild from "../models/enka/StarRailCharacterBuild";

const defaultImageBaseUrls: ImageBaseUrl[] = [
    {
        filePath: "UPPER_CAMEL_CASE",
        priority: 5,
        regexList: [/.*/],
        url: "https://enka.network/ui/hsr",
    },
];

/** @typedef */
export interface ClientOptions {
    userAgent: string,
    cacheDirectory: string | null,
    showFetchCacheLog: boolean,
    timeout: number,
    defaultLanguage: LanguageCode,
    imageBaseUrls: ImageBaseUrl[],
    githubToken: string | null,
    /** This will be used for fetching user data by uid. */
    apiBaseUrl: "https://enka.network/api/hsr/uid" | "https://api.mihomo.me/sr_info" | string,
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
            githubToken: null,
            apiBaseUrl: "https://enka.network/api/hsr/uid",
        }, options) as unknown as ClientOptions;

        this.cachedAssetsManager = new CachedAssetsManager(this);
    }


    /**
     * @param uid
     * @throws {APIError}
     */
    async fetchUser(uid: number | string): Promise<User> {
        if (isNaN(Number(uid))) throw new Error("Parameter `uid` must be a number or a string number.");

        const baseUrl = this.options.apiBaseUrl;
        const url = `${baseUrl}/${uid}`;

        const response = await fetchJSON(url, this, true);

        if (response.status !== 200) {
            switch (response.data["detail"]) {
                case "Invalid uid":
                    throw new InvalidUidFormatError(Number(uid), response.status, response.statusText);
                default:
                    throw new RequestError(`Request failed with unknown status code ${response.status} - ${response.statusText}\nError Detail: ${response.data["detail"]}\nRequest url: ${url}`, response.status, response.statusText);
            }
        } else if (response.data["retcode"]) {
            switch (response.data["retcode"]) {
                case 3612:
                    throw new UserNotFoundError(Number(uid));
                default:
                    throw new APIError(`Unknown error occurred. ErrorCode: ${response.data["retcode"]}`);
            }
        }

        return new User({ ...response.data }, this);
    }

    /**
     * @param playableOnly
     * @returns all character data
     */
    getAllCharacters(playableOnly = true): CharacterData[] {
        return new JsonReader(this.cachedAssetsManager.getStarRailCacheData("AvatarConfig")).filterObject((_, c) => (playableOnly && c.getAsNumber("AdventurePlayerID") === c.getAsNumber("AvatarID")) || !playableOnly).map(([, c]) => new CharacterData(c.getAsNumber("AvatarID"), this));
    }

    /**
     * @param excludeTestLightCones
     * @returns all light cone data
     */
    getAllLightCones(excludeTestLightCones = true): LightConeData[] {
        return new JsonReader(this.cachedAssetsManager.getStarRailCacheData("EquipmentConfig")).filterObject((_, lc) => (excludeTestLightCones && lc.has("AvatarBaseType")) || !excludeTestLightCones).map(([, lc]) => new LightConeData(lc.getAsNumber("EquipmentID"), this));
    }

    /**
     * @returns all relic data
     */
    getAllRelics(): RelicData[] {
        return new JsonReader(this.cachedAssetsManager.getStarRailCacheData("RelicConfig")).mapObject((_, relic) => new RelicData(relic.getAsNumber("ID"), this));
    }


    _getStarRailCharacterBuild(data: JsonObject, username: string, hash: string): StarRailCharacterBuild {
        return new StarRailCharacterBuild(data, this, username, hash);
    }

    _getUser(data: JsonObject): User {
        return new User(data, this);
    }
}

export default StarRail;