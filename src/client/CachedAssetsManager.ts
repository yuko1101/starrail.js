import fs from "fs";
import path from "path";
import { Axios } from "axios";
import unzip, { Entry } from "unzip-stream";
import { ConfigFile, JsonObject, JsonReader, bindOptions, move } from "config_file.js";
import { fetchJSON } from "../utils/axios_utils";
import ObjectKeysManager from "./ObjectKeysManager";
import StarRail from "./StarRail";
import { getStableHash } from "../utils/hash_utils";

const languages: LanguageCode[] = ["chs", "cht", "de", "en", "es", "fr", "id", "jp", "kr", "pt", "ru", "th", "vi"];

let dataMemory: { [key: string]: { [key: string]: JsonObject } } = {};


const initialLangDataMemory: NullableLanguageMap = { chs: null, cht: null, de: null, en: null, es: null, fr: null, id: null, jp: null, kr: null, pt: null, ru: null, th: null, vi: null };
let langDataMemory: NullableLanguageMap = { ...initialLangDataMemory };

let objectKeysManager: ObjectKeysManager | null;

/** @typedef */
export type NullableLanguageMap = { [key in LanguageCode]: { [key: string]: string } | null };
/** @typedef */
export type LanguageMap = { [key in LanguageCode]: { [key: string]: string } };

/**
 * @en LanguageCode
 * @typedef
 */
export type LanguageCode = "chs" | "cht" | "de" | "en" | "es" | "fr" | "id" | "jp" | "kr" | "pt" | "ru" | "th" | "vi";

// Thanks @Dimbreath
const contentBaseUrl = "https://raw.githubusercontent.com/Dimbreath/StarRailData/master";
const contents = [
    "AvatarConfig", // Characters
    "ItemConfigAvatar", // Characters as Items
    "DamageType", // Combat Types
    "AvatarBaseType", // Paths
    "AvatarSkillConfig", // Character Skills
    "AvatarSkillTreeConfig", // Character Skill Trees
    "AvatarRankConfig", // Character Eidolons
    "EquipmentConfig", // Light Cones
    "ItemConfigEquipment", // Light Cones as Items
    "EquipmentExpType", // Light Cone Exp Types
    "EquipmentSkillConfig", // Light Cone Superimpositions
    "RelicConfig", // Relics
    "ItemConfigRelic", // Relics as Items
    "RelicExpType", // Relic Exp Types
    "RelicMainAffixConfig", // Relic Main Stats
    "RelicSubAffixConfig", // Relic Sub Stats
    "RelicSetConfig", // Relic Sets
    "RelicSetSkillConfig", // Relic Set Bonus
    "AvatarPropertyConfig", // StatProperty
    "AvatarPlayerIcon", // Character Icon for a player
    "PlayerIcon", // Other Icon for a player
];

const textMapWhiteList: number[] = [

];

const getGitRemoteAPIUrl = (useRawStarRailData: boolean, rawDate: Date, date: Date) => useRawStarRailData
    ? `https://api.github.com/repos/Dimbreath/StarRailData/commits?sha=master&since=${rawDate.toISOString()}`
    : `https://api.github.com/repos/yuko1101/starrail.js/commits?sha=main&path=cache.zip&since=${date.toISOString()}`;

/**
 * @en CachedAssetsManager
 */
class CachedAssetsManager {
    /** The client that instantiated this */
    readonly client: StarRail;

    /** Default path of StarRail cache data directory */
    readonly defaultCacheDirectoryPath: string;
    /** List of the names of the files this library uses */
    readonly _contentsSrc: string[];
    /** List of supported languages */
    readonly _langs: string[];
    /** Path of directory where StarRail cache data is stored */
    cacheDirectoryPath: string;

    _cacheUpdater: NodeJS.Timer | null;
    _githubCache: ConfigFile | null;
    _isFetching: boolean;

    /**
     * @param client
    */
    constructor(client: StarRail) {
        this.client = client;
        this.defaultCacheDirectoryPath = path.resolve(__dirname, "..", "..", "cache");
        this._contentsSrc = contents;
        this._langs = languages;

        this.cacheDirectoryPath = client.options.cacheDirectory ?? this.defaultCacheDirectoryPath;
        this._cacheUpdater = null;
        this._githubCache = null;
        this._isFetching = false;
    }

    /** Create the necessary folders and files, and if the directory [cacheDirectoryPath](#cacheDirectoryPath) did not exist, move the cache files from the default path. */
    async cacheDirectorySetup(): Promise<void> {
        if (!fs.existsSync(this.cacheDirectoryPath)) {
            fs.mkdirSync(this.cacheDirectoryPath);

            const defaultCacheFiles = fs.readdirSync(this.defaultCacheDirectoryPath);
            if (defaultCacheFiles.length > 0) {
                try {
                    move(this.defaultCacheDirectoryPath, this.cacheDirectoryPath);
                } catch (e) {
                    console.error(`Auto-Moving cache data failed with error: ${e}`);
                }
            }
        }
        if (!fs.existsSync(path.resolve(this.cacheDirectoryPath, "data"))) {
            fs.mkdirSync(path.resolve(this.cacheDirectoryPath, "data"));
        }
        if (!fs.existsSync(path.resolve(this.cacheDirectoryPath, "langs"))) {
            fs.mkdirSync(path.resolve(this.cacheDirectoryPath, "langs"));
        }
        if (!fs.existsSync(path.resolve(this.cacheDirectoryPath, "github"))) {
            fs.mkdirSync(path.resolve(this.cacheDirectoryPath, "github"));
        }

        const githubCachePath = path.resolve(this.cacheDirectoryPath, "github", "starrail_data.json");
        if (!fs.existsSync(githubCachePath) || !this._githubCache) {
            this._githubCache = await new ConfigFile(githubCachePath, {
                "lastUpdate": 0,
                "rawLastUpdate": 0,
            }).load();
        }
    }

    /** Obtains a text map for a specific language, and if `store` is true, stores the data as a json file. */
    async fetchLanguageData(lang: LanguageCode, store = true): Promise<{ [key: string]: string }> {
        await this.cacheDirectorySetup();
        const url = `${contentBaseUrl}/TextMap/TextMap${(lang === "chs" ? "cn" : lang).toUpperCase()}.json`;
        const json = (await fetchJSON(url, this.client)).data;
        if (store) fs.writeFileSync(path.resolve(this.cacheDirectoryPath, "langs", `${lang}.json`), JSON.stringify(json));
        return json;
    }

    /**
     * @param useRawStarRailData Whether to fetch from github repo ({@link https://github.com/Dimbreath/StarRailData}) instead of downloading cache.zip
     * @returns Whether the game data update is available or not.
     */
    async checkForUpdates(useRawStarRailData = false): Promise<boolean> {
        await this.cacheDirectorySetup();
        const url = getGitRemoteAPIUrl(useRawStarRailData, new Date(this._githubCache?.getValue("rawLastUpdate") as (number | null | undefined) ?? 0), new Date(this._githubCache?.getValue("lastUpdate") as (number | null | undefined) ?? 0));

        const res = await fetchJSON(url, this.client);
        if (res.status !== 200) {
            throw new Error("Request Failed");
        }

        const data = res.data;

        return data.length !== 0;
    }

    /**
     * @param options.useRawStarRailData Whether to fetch from github repo ({@link https://github.com/Dimbreath/StarRailData}) instead of downloading cache.zip
     * @param options.ghproxy Whether to use ghproxy.com
     */
    async fetchAllContents(options: { useRawStarRailData?: boolean, ghproxy?: boolean }): Promise<void> {
        options = bindOptions({
            useRawStarRailData: false,
        }, options);

        await this.cacheDirectorySetup();

        this._isFetching = true;

        if (!options.useRawStarRailData) {
            if (this.client.options.showFetchCacheLog) {
                console.info("Downloading cache.zip...");
            }
            await this._downloadCacheZip();
            await this._githubCache?.set("lastUpdate", Date.now()).save();
            if (this.client.options.showFetchCacheLog) {
                console.info("Download completed");
            }
        } else {
            if (this.client.options.showFetchCacheLog) {
                console.info("Downloading structure data files...");
            }

            const promises: Promise<void>[] = [];
            const excelOutputData: { [s: string]: { [s: string]: JsonObject } } = {};
            for (const content of contents) {
                const fileName = `${content}.json`;
                const url = `${contentBaseUrl}/ExcelOutput/${fileName}`;
                promises.push((async () => {
                    const json = (await fetchJSON(url, this.client)).data;
                    if (this.client.options.showFetchCacheLog) {
                        console.info(`Downloaded data/${fileName}`);
                    }
                    excelOutputData[content] = json;
                })());
            }
            await Promise.all(promises);

            if (this.client.options.showFetchCacheLog) {
                console.info("> Downloaded all structure data files");
                console.info("Downloading language files...");
            }

            const langsData: NullableLanguageMap = { ...initialLangDataMemory };
            const langPromises: Promise<void>[] = [];
            for (const lang of languages) {
                langPromises.push(
                    (async () => {
                        const data = await this.fetchLanguageData(lang, false);
                        if (this.client.options.showFetchCacheLog) {
                            console.info(`Downloaded langs/${lang}.json`);
                        }
                        langsData[lang] = data;
                    })(),
                );
            }
            await Promise.all(langPromises);

            if (this.client.options.showFetchCacheLog) {
                console.info("> Downloaded all language files");
                console.info("Parsing data... (This may take more than 10 minutes)");
            }

            const clearLangsData: NullableLanguageMap = this.removeUnusedTextData(excelOutputData, langsData as LanguageMap);

            if (this.client.options.showFetchCacheLog) {
                console.info("> Parsing completed");
                console.info("Saving into files...");
            }

            for (const lang of Object.keys(clearLangsData) as LanguageCode[]) {
                fs.writeFileSync(path.resolve(this.cacheDirectoryPath, "langs", `${lang}.json`), JSON.stringify(clearLangsData[lang]));
            }

            for (const key in excelOutputData) {
                fs.writeFileSync(path.resolve(this.cacheDirectoryPath, "data", `${key}.json`), JSON.stringify(excelOutputData[key]));
            }

            await this._githubCache?.set("rawLastUpdate", Date.now()).save();

            if (this.client.options.showFetchCacheLog) {
                console.info(">> All Completed");
            }
        }
        this._isFetching = false;


    }

    /**
     * @returns whether all StarRail cache data files exist.
     */
    hasAllContents(): boolean {
        for (const lang of languages) {
            if (!fs.existsSync(path.resolve(this.cacheDirectoryPath, "langs", `${lang}.json`))) return false;
        }
        for (const content of contents) {
            const fileName = `${content}.json`;
            if (!fs.existsSync(path.resolve(this.cacheDirectoryPath, "data", fileName))) return false;
        }
        return true;
    }

    /**
     * @param options.useRawStarRailData Whether to fetch from github repo ({@link https://github.com/Dimbreath/StarRailData}) instead of downloading cache.zip
     * @param options.ghproxy Whether to use ghproxy.com
     * @returns true if there were any updates, false if there were no updates.
     */
    async updateContents(options: { useRawStarRailData?: boolean, ghproxy?: boolean, onUpdateStart?: () => Promise<void>, onUpdateEnd?: () => Promise<void> } = {}): Promise<void> {
        options = bindOptions({
            useRawStarRailData: false,
            ghproxy: false,
            onUpdateStart: null,
            onUpdateEnd: null,
        }, options);

        await this.cacheDirectorySetup();

        const url = getGitRemoteAPIUrl(!!options.useRawStarRailData, new Date((this._githubCache?.getValue("rawLastUpdate") ?? 0) as number), new Date((this._githubCache?.getValue("lastUpdate") ?? 0) as number));

        const res = await fetchJSON(url, this.client);
        if (res.status !== 200) {
            throw new Error("Request Failed");
        }

        const data = res.data;

        if (data.length !== 0) {
            await options.onUpdateStart?.();
            // fetch all because large file diff cannot be retrieved
            await this.fetchAllContents({ useRawStarRailData: options.useRawStarRailData, ghproxy: options.ghproxy });
            await options.onUpdateEnd?.();
        }
    }

    /**
     * @param options.useRawStarRailData Whether to fetch from github repo ({@link https://github.com/Dimbreath/StarRailData}) instead of downloading cache.zip
     * @param options.ghproxy Whether to use ghproxy.com
     * @param options.timeout in milliseconds
     */
    activateAutoCacheUpdater(options: { useRawStarRailData?: boolean, instant?: boolean, ghproxy?: boolean, timeout?: number, onUpdateStart?: () => Promise<void>, onUpdateEnd?: () => Promise<void>, onError?: (error: Error) => Promise<void> } = {}): void {
        options = bindOptions({
            useRawStarRailData: false,
            instant: true,
            ghproxy: false,
            timeout: 60 * 60 * 1000,
            onUpdateStart: null,
            onUpdateEnd: null,
            onError: null,
        }, options);
        if (options.timeout as number < 60 * 1000) throw new Error("timeout cannot be shorter than 1 minute.");
        if (options.instant) this.updateContents({ onUpdateStart: options.onUpdateStart, onUpdateEnd: options.onUpdateEnd, useRawStarRailData: options.useRawStarRailData, ghproxy: options.ghproxy });
        this._cacheUpdater = setInterval(async () => {
            if (this._isFetching) return;
            try {
                this.updateContents({ onUpdateStart: options.onUpdateStart, onUpdateEnd: options.onUpdateEnd, useRawStarRailData: options.useRawStarRailData, ghproxy: options.ghproxy });
            } catch (e) {
                if (e instanceof Error) options.onError?.(e);
            }
        }, options.timeout);
    }

    /**
     * Disables the updater activated by [activateAutoCacheUpdater](#activateAutoCacheUpdater)
     */
    deactivateAutoCacheUpdater(): void {
        if (this._cacheUpdater !== null) {
            clearInterval(this._cacheUpdater);
            this._cacheUpdater = null;
        }
    }

    /**
     * @param lang
     * @returns text map file path for a specific language
     */
    getLanguageDataPath(lang: LanguageCode): string {
        return path.resolve(this.cacheDirectoryPath, "langs", `${lang}.json`);
    }

    /**
     * @param name without extensions (.json)
     * @returns excel bin file path
     */
    getJSONDataPath(name: string): string {
        return path.resolve(this.cacheDirectoryPath, "data", `${name}.json`);
    }

    /**
     * @param name without extensions (.json)
     */
    getStarRailCacheData(name: string): { [key: string]: JsonObject } {
        if (!Object.keys(dataMemory).includes(name)) {
            dataMemory[name] = JSON.parse(fs.readFileSync(this.getJSONDataPath(name), "utf-8"));
        }
        return dataMemory[name];
    }

    /**
     * @param lang
     * @returns text map for a specific language
     */
    getLanguageData(lang: LanguageCode): { [key: string]: string } {
        langDataMemory[lang] ??= JSON.parse(fs.readFileSync(this.getLanguageDataPath(lang), "utf-8"));
        return langDataMemory[lang] ?? {};
    }

    /**
     * @returns ObjectKeysManager of this
     */
    getObjectKeysManager(): ObjectKeysManager {
        if (!objectKeysManager) objectKeysManager = new ObjectKeysManager(this);
        return objectKeysManager;
    }

    /**
     * Clean memory of cache data.
     * Then reload data that was loaded before the clean if `reload` is true.
     * If `reload` is false, load each file as needed.
     */
    refreshAllData(reload = false): void {
        const loadedData = reload ? Object.keys(dataMemory) : null;
        const loadedLangs = reload ? Object.keys(langDataMemory) as LanguageCode[] : null;

        dataMemory = {};
        langDataMemory = { ...initialLangDataMemory };

        objectKeysManager = null;

        if (reload && loadedData && loadedLangs) {
            for (const name of loadedData) {
                this.getStarRailCacheData(name);
            }
            for (const lang of loadedLangs) {
                this.getLanguageData(lang);
            }
            objectKeysManager = new ObjectKeysManager(this);
        }
    }


    /**
     * Remove all unused text map entries
     * @param data
     * @param langsData
     */
    removeUnusedTextData(data: { [s: string]: { [s: string]: JsonObject } }, langsData: LanguageMap, showLog = true): LanguageMap {
        const required: number[] = [];

        function push(...keys: number[]) {
            const len = keys.length;
            for (let i = 0; i < len; i++) {
                const key = keys[i];
                if (!required.includes(key)) required.push(key);
            }
        }

        push(...textMapWhiteList);

        Object.values(data["AvatarConfig"]).forEach(c => {
            const json = new JsonReader(c);
            push(
                json.getAsNumber("AvatarName", "Hash"),
            );
        });

        Object.values(data["ItemConfigAvatar"]).forEach(c => {
            const json = new JsonReader(c);
            push(
                json.getAsNumber("ItemBGDesc", "Hash"),
            );
        });

        Object.values(data["DamageType"]).forEach(d => {
            const json = new JsonReader(d);
            push(
                json.getAsNumber("DamageTypeName", "Hash"),
                json.getAsNumber("DamageTypeIntro", "Hash"),
            );
        });

        Object.values(data["AvatarBaseType"]).forEach(p => {
            const json = new JsonReader(p);
            push(
                json.getAsNumber("BaseTypeText", "Hash"),
                json.getAsNumber("BaseTypeDesc", "Hash"),
            );
        });

        Object.values(data["AvatarSkillConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(l);
                push(
                    json.getAsNumber("SkillName", "Hash"),
                    json.getAsNumber("SkillTag", "Hash"),
                    json.getAsNumber("SkillTypeDesc", "Hash"),
                    json.getAsNumber("SkillDesc", "Hash"),
                    json.getAsNumber("SimpleSkillDesc", "Hash"),
                );
            });
        });

        Object.values(data["AvatarSkillTreeConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(l);
                const name = json.getAsString("PointName");
                if (name !== "") push(getStableHash(name));
            });
        });

        Object.values(data["AvatarRankConfig"]).forEach(e => {
            const json = new JsonReader(e);
            push(
                getStableHash(json.getAsString("Name")),
                getStableHash(json.getAsString("Desc")),
            );
        });

        Object.values(data["EquipmentConfig"]).forEach(l => {
            const json = new JsonReader(l);
            push(
                json.getAsNumber("EquipmentName", "Hash"),
                json.getAsNumber("EquipmentDesc", "Hash"),
            );
        });

        Object.values(data["ItemConfigEquipment"]).forEach(l => {
            const json = new JsonReader(l);
            push(
                json.getAsNumber("ItemBGDesc", "Hash"),
                json.getAsNumber("ItemDesc", "Hash"),
            );
        });

        Object.values(data["EquipmentSkillConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(l);
                push(
                    json.getAsNumber("SkillName", "Hash"),
                    json.getAsNumber("SkillDesc", "Hash"),
                );
            });
        });

        Object.values(data["ItemConfigRelic"]).forEach(r => {
            const json = new JsonReader(r);
            push(
                json.getAsNumber("ItemName", "Hash"),
                json.getAsNumber("ItemBGDesc", "Hash"),
            );
        });

        Object.values(data["RelicSetConfig"]).forEach(s => {
            const json = new JsonReader(s);
            push(
                json.getAsNumber("SetName", "Hash"),
            );
        });

        Object.values(data["AvatarPropertyConfig"]).forEach(s => {
            const json = new JsonReader(s);
            push(
                json.getAsNumber("PropertyName", "Hash"),
                json.getAsNumber("PropertyNameSkillTree", "Hash"),
                json.getAsNumber("PropertyNameRelic", "Hash"),
                json.getAsNumber("PropertyNameFilter", "Hash"),
            );
        });

        const requiredStringKeys = required.filter(key => key).map(key => key.toString());

        if (showLog) console.info(`Required keys have been loaded (${requiredStringKeys.length.toLocaleString()} keys)`);

        const clearLangsData: NullableLanguageMap = { ...initialLangDataMemory };

        const keyCount = requiredStringKeys.length;
        for (const lang of Object.keys(langsData) as LanguageCode[]) {
            if (showLog) console.info(`Modifying language "${lang}"...`);
            clearLangsData[lang] = {};
            for (let i = 0; i < keyCount; i++) {
                const key = requiredStringKeys[i];
                const text = langsData[lang][key];
                if (text) {
                    (clearLangsData[lang] as JsonObject)[key] = text;
                } else {
                    // console.warn(`Required key ${key} was not found in language ${lang}.`);
                }
            }
            // console.log(Object.keys(langData).length + " keys in " + lang);
            // console.log(Object.keys(clearLangsData).length + " langs");
        }

        if (showLog) console.info("Removing unused keys completed.");

        return clearLangsData as LanguageMap;
    }

    /**
     * Download the zip file, which contains StarRail cache data, from {@link https://raw.githubusercontent.com/yuko1101/starrail.js/main/cache.zip}
     * @param options.ghproxy Whether to use ghproxy.com
     */
    async _downloadCacheZip(options: { ghproxy?: boolean } = {}): Promise<void> {
        options = bindOptions({
            ghproxy: false,
        }, options);

        const axios = new Axios({});

        const url = (options.ghproxy ? "https://ghproxy.com/" : "") + "https://raw.githubusercontent.com/yuko1101/starrail.js/main/cache.zip";

        const res = await axios.get(url, {
            responseType: "stream",
        }).catch(e => {
            throw new Error(`Failed to download StarRail data from ${url} with an error: ${e}`);
        });
        if (res.status == 200) {
            await new Promise<void>(resolve => {
                res.data
                    .pipe(unzip.Parse())
                    .on("entry", (entry: Entry) => {
                        const entryPath = entry.path.replace(/^cache\/?/, "");
                        const extractPath = path.resolve(this.cacheDirectoryPath, entryPath);

                        if (entry.type === "Directory") {
                            if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath);
                            entry.autodrain();
                        } else if (entryPath.startsWith("github/")) {
                            if (fs.existsSync(extractPath)) {
                                entry.autodrain();
                                return;
                            }
                            entry.pipe(fs.createWriteStream(extractPath));
                        } else {
                            entry.pipe(fs.createWriteStream(extractPath));
                        }
                    });
                res.data.on("close", () => {
                    resolve();
                });
            });

        } else {
            throw new Error(`Failed to download StarRail data from ${url} with status ${res.status} - ${res.statusText}`);
        }
    }
}

export default CachedAssetsManager;