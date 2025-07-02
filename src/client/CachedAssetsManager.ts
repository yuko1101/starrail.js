import fs from "fs";
import path from "path";
import { Axios } from "axios";
import unzip from "unzip-stream";
import yauzl from "yauzl";
import { ConfigFile, FlexJsonArray, FlexJsonElement, FlexJsonObject, JsonObject, JsonOptions, JsonReader, bindOptions, isFlexJsonObject, move } from "config_file.js";
import { fetchJSON } from "../utils/axios_utils";
import { ObjectKeysManager } from "./ObjectKeysManager";
import { StarRail } from "./StarRail";
import { getStableHash } from "../utils/hash_utils";
import jsonBigint from "json-bigint";
import { HashKey } from "../models/assets/TextAssets";
const JSONBig = jsonBigint({ useNativeBigInt: true });

export const excelJsonOptions = {
    allowBigint: true,
} satisfies JsonOptions;

export type ExcelJsonElement = FlexJsonElement<typeof excelJsonOptions>;
export type ExcelJsonObject<T extends ExcelJsonElement = ExcelJsonElement> = FlexJsonObject<typeof excelJsonOptions, T>;
export type ExcelJsonArray<T extends ExcelJsonElement = ExcelJsonElement> = FlexJsonArray<typeof excelJsonOptions, T>;

// Thanks @Dimbreath
const excelBaseUrl = "https://gitlab.com/Dimbreath/turnbasedgamedata/-/raw/main";

export type ExcelKey = string | [string, ExcelJsonElement];
export const excelKeyMap = {
    "AvatarConfig": ["AvatarID"], // Characters
    "ItemConfigAvatar": ["ID"], // Characters as Items
    "DamageType": ["ID"], // Combat Types
    "AvatarBaseType": [["ID", "Unknown"]], // Paths
    "AvatarSkillConfig": ["SkillID", "Level"], // Character Skills
    "AvatarServantSkillConfig": ["SkillID", "Level"], // Character Servant Skills
    "AvatarSkillTreeConfig": ["PointID", "Level"], // Character Skill Trees
    "AvatarRankConfig": ["RankID"], // Character Eidolons
    "AvatarPromotionConfig": ["AvatarID", ["Promotion", 0]], // Character Promotions and Character Basic Stats.
    "AvatarSkin": ["ID"], // Costumes

    "EquipmentConfig": ["EquipmentID"], // Light Cones
    "ItemConfigEquipment": ["ID"], // Light Cones as Items
    "EquipmentExpType": ["ExpType", "Level"], // Light Cone Exp Types
    "EquipmentSkillConfig": ["SkillID", "Level"], // Light Cone Superimpositions
    "EquipmentPromotionConfig": ["EquipmentID", ["Promotion", 0]], // Light Cone Promotions and Light Cone Basic Stats
    "RelicConfig": ["ID"], // Relics
    "ItemConfigRelic": ["ID"], // Relics as Items
    "RelicExpType": ["TypeID", ["Level", 0]], // Relic Exp Types
    "RelicMainAffixConfig": ["GroupID", "AffixID"], // Relic Main Stats
    "RelicSubAffixConfig": ["GroupID", "AffixID"], // Relic Sub Stats
    "RelicSetConfig": ["SetID"], // Relic Sets
    "RelicSetSkillConfig": ["SetID", "RequireNum"], // Relic Set Bonus
    "RelicBaseType": [["Type", "All"]], // Relic Types
    "AvatarPropertyConfig": ["PropertyType"], // StatProperty

    // Character Icon for a player
    "ItemConfigAvatarPlayerIcon": ["ID"],
    "AvatarPlayerIcon": ["ID"],

    // Other Icon for a player
    "ItemPlayerCard": ["ID"],
    "PlayerIcon": ["ID"],
} as const satisfies Record<string, ExcelKey[]>;
export type ExcelType = keyof typeof excelKeyMap;
export const excels = Object.keys(excelKeyMap) as ExcelType[];
export type LoadedExcelDataMap = { [excel in keyof typeof excelKeyMap]: SingleBy<typeof excelKeyMap[excel]> };
export type ExcelDataMap = { [excel in keyof typeof excelKeyMap]: LoadedExcelDataMap[excel] | null };
const initialExcelDataMemory = Object.fromEntries(excels.map(content => [content, null])) as ExcelDataMap;
let excelDataMemory: ExcelDataMap = { ...initialExcelDataMemory };

export const languages = ["chs", "cht", "de", "en", "es", "fr", "id", "jp", "kr", "pt", "ru", "th", "vi"] as const;
export type LanguageCode = typeof languages[number];
export type LoadedLanguageMap = Record<LanguageCode, Record<string, string>>;
export type LanguageMap = { [key in LanguageCode]: LoadedLanguageMap[key] | null };
const initialLangDataMemory: LanguageMap = Object.fromEntries(languages.map(lang => [lang, null])) as LanguageMap;
let langDataMemory: LanguageMap = { ...initialLangDataMemory };

let objectKeysManager: ObjectKeysManager | null;

const textMapWhiteList: number[] = [

];

const getGitRemoteAPIUrl = (useRawStarRailData: boolean, rawDate: Date, date: Date) => useRawStarRailData
    ? `https://gitlab.com/api/v4/projects/62701613/repository/commits?since=${rawDate.toISOString()}`
    : `https://api.github.com/repos/yuko1101/starrail.js/commits?sha=main&path=cache.zip&since=${date.toISOString()}`;

export class CachedAssetsManager {
    /** The client that instantiated this */
    readonly client: StarRail;

    /** Default path of StarRail cache data directory */
    readonly defaultCacheDirectoryPath: string;
    /** List of the names of the files this library uses */
    readonly _excels: ExcelType[];
    /** List of supported languages */
    readonly _langs: typeof languages;
    /** Path of directory where StarRail cache data is stored */
    cacheDirectoryPath: string;

    _cacheUpdater: NodeJS.Timeout | null;
    _githubCache: ConfigFile<{ allowBigint: false }> | null;
    _isFetching: boolean;

    constructor(client: StarRail) {
        this.client = client;
        this.defaultCacheDirectoryPath = path.resolve(__dirname, "..", "..", "cache");
        this._excels = excels;
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
            this._githubCache = await new ConfigFile(githubCachePath, { allowBigint: false }, {
                "lastUpdate": 0,
                "rawLastUpdate": 0,
            }).load();
        }
    }

    /** Obtains a text map for a specific language. */
    async fetchLanguageData(lang: LanguageCode): Promise<JsonObject<string>> {
        await this.cacheDirectorySetup();
        const url = `${excelBaseUrl}/TextMap/TextMap${lang.toUpperCase()}.json`;
        const json = (await fetchJSON(url, this.client)).data;
        return json;
    }

    /**
     * @param useRawStarRailData Whether to fetch from gitlab repo ({@link https://gitlab.com/Dimbreath/turnbasedgamedata}) instead of downloading cache.zip
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
     * @param options.useRawStarRailData Whether to fetch from gitlab repo ({@link https://gitlab.com/Dimbreath/turnbasedgamedata}) instead of downloading cache.zip
     * @param options.ghproxy Whether to use ghproxy.com
     */
    async fetchAllContents(options: { useRawStarRailData?: boolean, ghproxy?: boolean }): Promise<void> {
        if (this._isFetching) {
            throw new Error("You are already fetching assets.");
        }

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
            const excelOutputData: ExcelJsonObject = { ...initialExcelDataMemory };
            for (const excel of excels) {
                const fileName = `${excel}.json`;
                const url = `${excelBaseUrl}/ExcelOutput/${fileName}`;
                promises.push((async () => {
                    const json = (await fetchJSON(url, this.client, false, true)).data as ExcelJsonObject[];
                    if (this.client.options.showFetchCacheLog) {
                        console.info(`Downloaded data/${fileName}`);
                    }
                    excelOutputData[excel] = this.formatExcel(excel, json);
                })());
            }
            await Promise.all(promises);

            if (this.client.options.showFetchCacheLog) {
                console.info("> Downloaded all structure data files");
                console.info("Downloading language files...");
            }

            const langsData: LanguageMap = { ...initialLangDataMemory };
            const langPromises: Promise<void>[] = [];
            for (const lang of languages) {
                langPromises.push(
                    (async () => {
                        const data = await this.fetchLanguageData(lang);
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

            const clearLangsData = this.removeUnusedTextData(excelOutputData as LoadedExcelDataMap, langsData as LoadedLanguageMap);

            if (this.client.options.showFetchCacheLog) {
                console.info("> Parsing completed");
                console.info("Saving into files...");
            }

            for (const lang of Object.keys(clearLangsData) as LanguageCode[]) {
                fs.writeFileSync(path.resolve(this.cacheDirectoryPath, "langs", `${lang}.json`), JSON.stringify(clearLangsData[lang]));
            }

            for (const excel of Object.keys(excelOutputData) as ExcelType[]) {
                fs.writeFileSync(path.resolve(this.cacheDirectoryPath, "data", `${excel}.json`), JSONBig.stringify(excelOutputData[excel]));
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
        for (const excel of excels) {
            const fileName = `${excel}.json`;
            if (!fs.existsSync(path.resolve(this.cacheDirectoryPath, "data", fileName))) return false;
        }
        return true;
    }

    /**
     * @param options.useRawStarRailData Whether to fetch from gitlab repo ({@link https://gitlab.com/Dimbreath/turnbasedgamedata}) instead of downloading cache.zip
     * @param options.ghproxy Whether to use ghproxy.com
     * @returns true if there were any updates, false if there were no updates.
     */
    async updateContents(options: { useRawStarRailData?: boolean, ghproxy?: boolean, onUpdateStart?: () => Promise<void>, onUpdateEnd?: () => Promise<void> } = {}): Promise<void> {
        options = bindOptions({
            useRawStarRailData: false,
            ghproxy: false,
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
     * @param options.useRawStarRailData Whether to fetch from gitlab repo ({@link https://gitlab.com/Dimbreath/turnbasedgamedata}) instead of downloading cache.zip
     * @param options.ghproxy Whether to use ghproxy.com
     * @param options.timeout in milliseconds
     */
    activateAutoCacheUpdater(options: { useRawStarRailData?: boolean, instant?: boolean, ghproxy?: boolean, timeout?: number, onUpdateStart?: () => Promise<void>, onUpdateEnd?: () => Promise<void>, onError?: (error: Error) => Promise<void> } = {}): void {
        options = bindOptions({
            useRawStarRailData: false,
            instant: true,
            ghproxy: false,
            timeout: 60 * 60 * 1000,
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
     * @returns text map file path for a specific language
     */
    getLanguageDataPath(lang: LanguageCode): string {
        return path.resolve(this.cacheDirectoryPath, "langs", `${lang}.json`);
    }

    _getExcelDataPath(excel: ExcelType): string {
        return path.resolve(this.cacheDirectoryPath, "data", `${excel}.json`);
    }

    _getExcelData<T extends ExcelType>(excel: T): SingleBy<typeof excelKeyMap[T]> {
        excelDataMemory[excel] ??= JSONBig.parse(fs.readFileSync(this._getExcelDataPath(excel), "utf-8"));
        const excelData = excelDataMemory[excel];
        if (!excelData) throw new Error(`Failed to load ${excel} excel.`);
        return excelData;
    }

    getExcelData<T extends ExcelType, U extends (string | number)[]>(excel: T, ...keys: U): IndexBy<SingleBy<typeof excelKeyMap[T]>, U> {
        const excelData = this._getExcelData(excel);

        return indexBy(excelData, ...keys);
    }

    /**
     * @returns text map for a specific language
     */
    getLanguageData(lang: LanguageCode): JsonObject<string> {
        langDataMemory[lang] ??= JSON.parse(fs.readFileSync(this.getLanguageDataPath(lang), "utf-8"));
        const langData = langDataMemory[lang];
        if (!langData) throw new Error(`Failed to load ${lang} language data.`);
        return langData;
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
        const loadedData = reload ? Object.keys(excelDataMemory) as ExcelType[] : [];
        const loadedLangs = reload ? Object.keys(langDataMemory) as LanguageCode[] : null;

        excelDataMemory = { ...initialExcelDataMemory };
        langDataMemory = { ...initialLangDataMemory };

        objectKeysManager = null;

        if (reload && loadedData && loadedLangs) {
            for (const name of loadedData) {
                this._getExcelData(name);
            }
            for (const lang of loadedLangs) {
                this.getLanguageData(lang);
            }
            objectKeysManager = new ObjectKeysManager(this);
        }
    }

    formatExcel<T extends ExcelType>(excel: T, data: ExcelJsonObject[]): SingleBy<typeof excelKeyMap[T]> {
        const keys = excelKeyMap[excel];
        return singleBy(data, ...keys);
    }

    /**
     * Remove all unused text map entries
     */
    removeUnusedTextData(data: LoadedExcelDataMap, langsData: LoadedLanguageMap, showLog = true): LoadedLanguageMap {
        const requiredKeys = new Set<string>();

        function push(...keys: (HashKey | null)[]) {
            const len = keys.length;
            for (let i = 0; i < len; i++) {
                const key = keys[i];
                if (key === null) continue;
                const keyStr = key.toString();
                if (!requiredKeys.has(keyStr)) requiredKeys.add(keyStr);
            }
        }

        push(...textMapWhiteList);

        Object.values(data["AvatarConfig"]).forEach(c => {
            const json = new JsonReader(excelJsonOptions, c);
            push(
                json.getAsNumberOrBigint("AvatarName", "Hash"),
            );
        });

        Object.values(data["ItemConfigAvatar"]).forEach(c => {
            const json = new JsonReader(excelJsonOptions, c);
            push(
                json.getAsNumberOrBigint("ItemBGDesc", "Hash"),
            );
        });

        Object.values(data["DamageType"]).forEach(d => {
            const json = new JsonReader(excelJsonOptions, d);
            push(
                json.getAsNumberOrBigint("DamageTypeName", "Hash"),
                json.getAsNumberOrBigint("DamageTypeIntro", "Hash"),
            );
        });

        Object.values(data["AvatarBaseType"]).forEach(p => {
            const json = new JsonReader(excelJsonOptions, p);
            push(
                json.getAsNumberOrBigint("BaseTypeText", "Hash"),
                json.getAsNumberOrBigint("BaseTypeDesc", "Hash"),
            );
        });

        Object.values(data["AvatarSkillConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(excelJsonOptions, l);
                push(
                    json.getAsNumberOrBigint("SkillName", "Hash"),
                    json.getAsNumberOrBigint("SkillTag", "Hash"),
                    json.getAsNumberOrBigint("SkillTypeDesc", "Hash"),
                    json.getAsNumberOrBigintWithDefault(null, "SkillDesc", "Hash"),
                    json.getAsNumberOrBigintWithDefault(null, "SimpleSkillDesc", "Hash"),
                );
            });
        });

        Object.values(data["AvatarServantSkillConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(excelJsonOptions, l);
                push(
                    json.getAsNumberOrBigint("SkillName", "Hash"),
                    json.getAsNumberOrBigint("SkillTag", "Hash"),
                    json.getAsNumberOrBigint("SkillTypeDesc", "Hash"),
                    json.getAsNumberOrBigintWithDefault(null, "SkillDesc", "Hash"),
                    json.getAsNumberOrBigintWithDefault(null, "SimpleSkillDesc", "Hash"),
                );
            });
        });

        Object.values(data["AvatarSkillTreeConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(excelJsonOptions, l);
                const name = json.getAsString("PointName");
                if (name !== "") push(getStableHash(name));
                const description = json.getAsString("PointDesc");
                if (description !== "") push(getStableHash(description));
            });
        });

        Object.values(data["AvatarRankConfig"]).forEach(e => {
            const json = new JsonReader(excelJsonOptions, e);
            push(
                getStableHash(json.getAsString("Name")),
                getStableHash(json.getAsString("Desc")),
            );
        });

        Object.values(data["AvatarSkin"]).forEach(s => {
            const json = new JsonReader(excelJsonOptions, s);
            push(
                json.getAsNumberOrBigint("AvatarSkinName", "Hash"),
            );
        });

        Object.values(data["EquipmentConfig"]).forEach(l => {
            const json = new JsonReader(excelJsonOptions, l);
            push(
                json.getAsNumberOrBigint("EquipmentName", "Hash"),
                json.getAsNumberOrBigintWithDefault(null, "EquipmentDesc", "Hash"),
            );
        });

        Object.values(data["ItemConfigEquipment"]).forEach(l => {
            const json = new JsonReader(excelJsonOptions, l);
            push(
                json.getAsNumberOrBigint("ItemBGDesc", "Hash"),
                json.getAsNumberOrBigint("ItemDesc", "Hash"),
            );
        });

        Object.values(data["EquipmentSkillConfig"]).forEach(s => {
            Object.values(s).forEach(l => {
                const json = new JsonReader(excelJsonOptions, l);
                push(
                    json.getAsNumberOrBigint("SkillName", "Hash"),
                    json.getAsNumberOrBigint("SkillDesc", "Hash"),
                );
            });
        });

        Object.values(data["ItemConfigRelic"]).forEach(r => {
            const json = new JsonReader(excelJsonOptions, r);
            push(
                json.getAsNumberOrBigint("ItemName", "Hash"),
                json.getAsNumberOrBigint("ItemBGDesc", "Hash"),
            );
        });

        Object.values(data["RelicSetConfig"]).forEach(s => {
            const json = new JsonReader(excelJsonOptions, s);
            push(
                json.getAsNumberOrBigint("SetName", "Hash"),
            );
        });

        Object.values(data["RelicSetSkillConfig"]).forEach(s => {
            Object.values(s).forEach(b => {
                const json = new JsonReader(excelJsonOptions, b);
                push(
                    getStableHash(json.getAsString("SkillDesc")),
                );
            });
        });

        Object.values(data["RelicBaseType"]).forEach(t => {
            const json = new JsonReader(excelJsonOptions, t);
            push(
                json.getAsNumberOrBigintWithDefault(null, "BaseTypeText", "Hash"),
            );
        });

        Object.values(data["AvatarPropertyConfig"]).forEach(s => {
            const json = new JsonReader(excelJsonOptions, s);
            push(
                json.getAsNumberOrBigint("PropertyName", "Hash"),
                json.getAsNumberOrBigintWithDefault(null, "PropertyNameSkillTree", "Hash"),
                json.getAsNumberOrBigint("PropertyNameRelic", "Hash"),
                json.getAsNumberOrBigint("PropertyNameFilter", "Hash"),
            );
        });

        [...Object.values(data["ItemConfigAvatarPlayerIcon"]), ...Object.values(data["ItemPlayerCard"])].forEach(i => {
            const json = new JsonReader(excelJsonOptions, i);
            push(
                json.getAsNumberOrBigint("ItemName", "Hash"),
            );
        });

        if (showLog) console.info(`Required keys have been loaded (${requiredKeys.size.toLocaleString()} keys)`);

        const clearLangsData: LanguageMap = { ...initialLangDataMemory };

        for (const lang of Object.keys(langsData) as LanguageCode[]) {
            if (showLog) console.info(`Modifying language "${lang}"...`);
            clearLangsData[lang] = {};
            for (const key of requiredKeys) {
                const text = langsData[lang][key];
                if (text) {
                    (clearLangsData[lang] as ExcelJsonObject)[key] = text;
                } else {
                    // console.warn(`Required key ${key} was not found in language ${lang}.`);
                }
            }
            // console.log(Object.keys(langData).length + " keys in " + lang);
            // console.log(Object.keys(clearLangsData).length + " langs");
        }

        if (showLog) console.info("Removing unused keys completed.");

        return clearLangsData as LoadedLanguageMap;
    }

    /**
     * Download the zip file, which contains StarRail cache data, from {@link https://raw.githubusercontent.com/yuko1101/starrail.js/main/cache.zip}
     * @param options.ghproxy Whether to use ghproxy.com
     */
    async _downloadCacheZip(options: { ghproxy?: boolean, stream?: boolean } = {}): Promise<void> {
        const opt = bindOptions({
            ghproxy: false,
            stream: false,
        }, options);

        const axios = new Axios({});

        const url = (opt.ghproxy ? "https://ghproxy.com/" : "") + "https://raw.githubusercontent.com/yuko1101/starrail.js/main/cache.zip";

        const res = await axios.get(url, {
            responseType: "stream",
        }).catch(e => {
            throw new Error(`Failed to download StarRail data from ${url} with an error: ${e}`);
        });

        const stream = res.data as NodeJS.ReadableStream;

        if (res.status == 200) {
            if (opt.stream) {
                await this._unzipStream(stream);
            } else {
                await this.cacheDirectorySetup();
                const filePath = path.resolve(this.cacheDirectoryPath, "cache.zip");
                const writer = fs.createWriteStream(filePath);
                await new Promise<void>((resolve, reject) => {
                    stream.pipe(writer);
                    writer.on("finish", () => {
                        resolve();
                    });
                    writer.on("error", (e) => {
                        reject(e);
                    });
                });
                await this._unzipFile(filePath);
            }
        } else {
            throw new Error(`Failed to download StarRail data from ${url} with status ${res.status} - ${res.statusText}`);
        }
    }

    _unzipStream(stream: NodeJS.ReadableStream): Promise<void> {
        const cacheDir = path.resolve(this.cacheDirectoryPath);
        return new Promise<void>(resolve => {
            stream
                .pipe(unzip.Parse())
                .on("entry", (entry: unzip.Entry) => {
                    const entryPath = entry.path.replace(/^cache\/?/, "");
                    const extractPath = path.resolve(cacheDir, entryPath);
                    if (!extractPath.startsWith(cacheDir)) {
                        console.warn(`Skipping potentially unsafe entry path: ${entryPath}`);
                        entry.autodrain();
                        return;
                    }

                    if (this.client.options.showFetchCacheLog) console.info(`- Downloading ${entryPath}`);

                    if (entry.type === "Directory") {
                        if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath, { recursive: true });
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
            stream.on("close", () => {
                resolve();
            });
        });
    }

    _unzipFile(filePath: string): Promise<void> {
        const cacheDir = path.resolve(this.cacheDirectoryPath);
        return new Promise<void>(resolve => {
            yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
                if (err) throw err;
                zipfile.readEntry();
                zipfile.on("entry", (entry: yauzl.Entry) => {
                    const entryPath = entry.fileName.replace(/^cache\/?/, "");
                    const extractPath = path.resolve(cacheDir, entryPath);
                    if (!extractPath.startsWith(cacheDir)) {
                        console.warn(`Skipping potentially unsafe entry path: ${entryPath}`);
                        zipfile.readEntry();
                        return;
                    }

                    if (this.client.options.showFetchCacheLog) console.info(`- Extracting ${entryPath}`);

                    if (entry.fileName.endsWith("/")) {
                        if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath, { recursive: true });
                        zipfile.readEntry();
                    } else if (entryPath.startsWith("github/")) {
                        if (fs.existsSync(extractPath)) {
                            zipfile.readEntry();
                            return;
                        }
                        zipfile.openReadStream(entry, (err, stream) => {
                            if (err) throw err;
                            stream.pipe(fs.createWriteStream(extractPath));
                            stream.on("end", () => {
                                zipfile.readEntry();
                            });
                        });
                    } else {
                        zipfile.openReadStream(entry, (err, stream) => {
                            if (err) throw err;
                            stream.pipe(fs.createWriteStream(extractPath));
                            stream.on("end", () => {
                                zipfile.readEntry();
                            });
                        });
                    }
                });
                zipfile.on("close", () => {
                    resolve();
                });
            });
        });
    }
}


export type IndexBy<T, Keys extends (string | number)[]> =
    Keys extends [string | number, ...infer U]
    ? U extends (string | number)[]
    ? T extends ExcelJsonObject<infer V>
    ? IndexBy<V, U> | undefined
    : unknown
    : T extends ExcelJsonObject<infer V>
    ? V | undefined
    : unknown
    : T;
export function indexBy<T extends ExcelJsonObject, U extends (string | number)[]>(data: T, ...keys: U): IndexBy<T, U> {
    if (keys.length === 0) return data as IndexBy<T, U>;
    const v = data[keys[0]];
    if (!isFlexJsonObject(excelJsonOptions, v)) return undefined as IndexBy<T, U>;
    return indexBy(v, ...keys.slice(1)) as IndexBy<T, U>;
}

export type SingleBy<Keys extends ExcelKey[]> = Keys extends [ExcelKey, ...infer T] ? T extends ExcelKey[] ? ExcelJsonObject<SingleBy<T>> : never : ExcelJsonObject;
export function singleBy<T extends ExcelKey[]>(array: ExcelJsonArray<ExcelJsonObject>, ...keys: T): SingleBy<T> {
    if (keys.length === 0) {
        if (array.length > 1) throw Error("Cannot have multiple elements");
        return array[0] as SingleBy<T>;
    }
    const grouped: ExcelJsonObject<ExcelJsonObject[]> = {};
    for (const e of array) {
        const key = Array.isArray(keys[0]) ? keys[0][0] : keys[0];
        if (!(key in e) && Array.isArray(keys[0])) e[key] = keys[0][1];
        const id = e[key]?.toString();
        if (!id) throw new Error("Some elements don't have specified keys");
        if (!(id in grouped)) grouped[id] = [];
        grouped[id].push(e);
    }

    const recursiveGrouped: ExcelJsonObject = {};
    for (const key in grouped) {
        const arr = grouped[key];
        recursiveGrouped[key] = singleBy(arr, ...keys.slice(1));
    }

    return recursiveGrouped as SingleBy<T>;
}
