import { JsonReader, JsonObject, bindOptions, renameKeys } from "config_file.js";
import CachedAssetsManager, { LanguageCode } from "./CachedAssetsManager";
import CharacterData from "../models/character/CharacterData";
import { CustomImageBaseUrl, ImageBaseUrl } from "../models/assets/ImageAssets";
import LightConeData from "../models/light_cone/LightConeData";
import RelicData from "../models/relic/RelicData";
import { fetchJSON } from "../utils/axios_utils";
import StarRailUser from "../models/StarRailUser";
import { EnkaLibrary, EnkaSystem, InvalidUidFormatError, EnkaNetworkError, UserNotFoundError, EnkaGameAccount } from "enka-system";
import StarRailCharacterBuild from "../models/enka/StarRailCharacterBuild";
import { Overwrite } from "../utils/ts_utils";

const starRialResMap = {
    "SpriteOutput/AvatarIcon": "icon/character",
    "SpriteOutput/ItemIcon": "icon/item",
    "SpriteOutput/UI/Avatar/Icon": "icon/property",
    "SpriteOutput/UI/Nature/IconAttributeMiddle": "icon/element",
} as const;

const defaultImageBaseUrls: (ImageBaseUrl | CustomImageBaseUrl)[] = [
    {
        filePath: "UPPER_CAMEL_CASE",
        priority: 5,
        format: "PNG",
        regexList: [
            /^SpriteOutput\/SkillIcons\/\d+\/SkillIcon_\d+_(?!Ultra_on)/,
            /^SpriteOutput\/ItemIcon\/RelicIcons\/(.+)$/,
            /^SpriteOutput\/(AvatarRoundIcon|AvatarDrawCard|LightConeFigures)\/(.+)$/,
            /^SpriteOutput\/UI\/Avatar\/Icon\/(.+)$/,
        ],
        url: "https://enka.network/ui/hsr",
        customParser: (path: string) => path.replace(/(?<=^SpriteOutput\/SkillIcons\/)\d+\//, ""),
    },
    {
        filePath: "UPPER_CAMEL_CASE",
        priority: 4,
        format: "PNG",
        regexList: Object.keys(starRialResMap).map((key) => new RegExp(`^${key}/([^/]+)$`)),
        url: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master",
        customParser: (path: string) => {
            const split = path.split("/");
            const fileName = split.pop() as string;
            const dir = split.join("/");
            const value = starRialResMap[dir as keyof typeof starRialResMap];

            switch (value) {
                case "icon/character":
                case "icon/item":
                case "icon/property":
                    return `${value}/${fileName}`;
                case "icon/element":
                    return `${value}/${fileName.replace(/^IconAttribute/, "").replace("Thunder", "Lightning")}`;
            }
        },
    },
    {
        filePath: "LOWER_CASE",
        priority: 3,
        format: "WEBP",
        regexList: [
            /^SpriteOutput\/(AvatarShopIcon|AvatarRoundIcon|AvatarDrawCard|RelicFigures|ItemFigures|LightConeMaxFigures|LightConeMediumIcon)\/(.+)/,
            /^UI\/UI3D\/Rank\/_dependencies\/Textures\/\d+\/\d+_Rank_[1-6]/,
        ],
        url: "https://api.hakush.in/hsr/UI",
        customParser: (path: string) => path.replace(/^(spriteoutput|ui\/ui3d)\//, "").replace(/\.png$/, ".webp"),
    },
];

/** @typedef */
export interface ClientOptions {
    userAgent: string;
    cacheDirectory: string | null;
    showFetchCacheLog: boolean;
    requestTimeout: number;
    defaultLanguage: LanguageCode;
    imageBaseUrls: ImageBaseUrl[];
    githubToken: string | null;
    /** This will be used for fetching user data by uid. */
    apiBaseUrl: "https://enka.network/api/hsr/uid" | "https://api.mihomo.me/sr_info" | string;
    readonly enkaSystem: EnkaSystem;
}

/** @constant */
export const defaultClientOption: Overwrite<ClientOptions, { "enkaSystem": EnkaSystem | null }> = {
    userAgent: "Mozilla/5.0",
    cacheDirectory: null,
    showFetchCacheLog: true,
    requestTimeout: 3000,
    defaultLanguage: "en",
    imageBaseUrls: [...defaultImageBaseUrls],
    githubToken: null,
    apiBaseUrl: "https://enka.network/api/hsr/uid",
    enkaSystem: null,
};

/**
 * @en StarRail
 */
class StarRail implements EnkaLibrary<StarRailUser, StarRailCharacterBuild> {
    readonly hoyoType: 1;
    getUser(data: JsonObject): StarRailUser {
        const fixedData = renameKeys(data, { "player_info": "detailInfo" });
        return new StarRailUser(fixedData, this);
    }
    getCharacterBuild(data: JsonObject, username: string, hash: string): StarRailCharacterBuild {
        return new StarRailCharacterBuild(data, this, username, hash);
    }


    /** The options the client was instantiated with */
    readonly options: ClientOptions;

    /**  */
    readonly cachedAssetsManager: CachedAssetsManager;

    /**
     * @param options
     */
    constructor(options: Partial<ClientOptions>) {
        this.hoyoType = 1;

        const mergedOptions = bindOptions(defaultClientOption, options);
        if (!mergedOptions.enkaSystem) {
            if (EnkaSystem.instance.getLibrary(this.hoyoType)) {
                mergedOptions.enkaSystem = new EnkaSystem();
            } else {
                mergedOptions.enkaSystem = EnkaSystem.instance;
            }
        }
        this.options = mergedOptions as unknown as ClientOptions;

        this.cachedAssetsManager = new CachedAssetsManager(this);

        this.options.enkaSystem.registerLibrary(this);
    }


    /**
     * @param uid
     * @throws {EnkaNetworkError}
     */
    async fetchUser(uid: number | string): Promise<StarRailUser> {
        if (isNaN(Number(uid))) throw new Error("Parameter `uid` must be a number or a string number.");

        const baseUrl = this.options.apiBaseUrl;
        const url = `${baseUrl}/${uid}`;

        // TODO: data caching
        const response = await fetchJSON(url, this, true);

        if (response.status !== 200) {
            switch (response.status) {
                case 400:
                    throw new InvalidUidFormatError(Number(uid), response.status, response.statusText);
                case 424:
                    throw new EnkaNetworkError("Request to enka.network failed because it is under maintenance.", response.status, response.statusText);
                case 429:
                    throw new EnkaNetworkError("Rate Limit reached. You reached enka.network's rate limit. Please try again in a few minutes.", response.status, response.statusText);
                case 404:
                    throw new UserNotFoundError(`User with uid ${uid} was not found. Please check whether the uid is correct. If you find the uid is correct, it may be a internal server error.`, response.status, response.statusText);
                default:
                    throw new EnkaNetworkError(`Request failed with unknown status code ${response.status} - ${response.statusText}\nError Detail: ${response.data["detail"]}\nRequest url: ${url}`, response.status, response.statusText);
            }
        } else if (response.data["retcode"]) {
            // only for mihomo api
            switch (response.data["retcode"]) {
                case 3612:
                    throw new UserNotFoundError(`User with uid ${uid} was not found. Please check whether the uid is correct. If you find the uid is correct, it may be a internal server error.`, response.status, response.statusText);
                default:
                    throw new Error(`Unknown server error occurred. ErrorCode(retcode): ${response.data["retcode"]}`);
            }
        }

        return new StarRailUser({ ...response.data }, this);
    }

    /**
     * @param username enka.network username, not in-game nickname
     * @returns the starrail accounts added to the Enka.Network account
     */
    async fetchEnkaStarRailAccounts(username: string): Promise<EnkaGameAccount<StarRail>[]> {
        return await this.options.enkaSystem.fetchEnkaGameAccounts(username, [1]) as EnkaGameAccount<StarRail>[];
    }

    /**
     * @param username enka.network username, not in-game nickname
     * @param hash EnkaGameAccount hash
     * @returns the starrail account with provided hash
     */
    async fetchEnkaStarRailAccount(username: string, hash: string): Promise<EnkaGameAccount<StarRail>> {
        return await this.options.enkaSystem.fetchEnkaGameAccount(username, hash);
    }

    /**
     * @param username enka.network username, not in-game nickname
     * @param hash EnkaGameAccount hash
     * @returns the starrail character builds including saved builds in Enka.Network account
     */
    async fetchEnkaStarRailBuilds(username: string, hash: string): Promise<{ [characterId: string]: StarRailCharacterBuild[] }> {
        return await this.options.enkaSystem.fetchEnkaCharacterBuilds<StarRail>(username, hash);
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
}

export default StarRail;