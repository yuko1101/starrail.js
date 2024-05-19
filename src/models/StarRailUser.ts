import { JsonObject, JsonReader } from "config_file.js";
import { EnkaProfile, User } from "enka-system";
import StarRail from "../client/StarRail";
import Character from "./character/Character";
import UserIcon from "./UserIcon";

export interface Birthday {
    month: number;
    day: number;
}

export type Platform = "PC" | "ANDROID" | "IOS" | "PS5";

export const platformMap: { [key: number]: Platform } = {
    1: "IOS",
    2: "ANDROID",
    3: "PC",
    11: "PS5",
};

export interface ForgottenHallInfo {
    memory: {
        maxLevel: number,
    }
}

export interface ChallengeInfo {
    level: number,
    stars: number,
    forgottenHall: ForgottenHallInfo,
}

class StarRailUser extends User {
    readonly client: StarRail;

    /** This will be NaN if this StarRailUser is from [EnkaGameAccount](https://enka-system.vercel.app/docs/api/EnkaGameAccount) and [isUidPublic](https://enka-system.vercel.app/docs/api/EnkaGameAccount#isUidPublic) is `false`. */
    readonly uid: number;
    readonly nickname: string;
    readonly signature: string | null;
    readonly icon: UserIcon;
    /** Trailblaze level */
    readonly level: number;
    /** World level */
    readonly equilibriumLevel: number;
    readonly platform: Platform | null;
    readonly friends: number;
    readonly achievementCount: number;
    readonly characterCount: number;
    readonly lightConeCount: number;
    readonly bookCount: number;
    readonly relicCount: number;
    readonly musicCount: number;
    readonly challengeInfo: ChallengeInfo;
    readonly simulatedUniverse: number;
    /** Whether the user displays characters in their showcase. */
    readonly isDisplayCharacter: boolean;
    readonly supportCharacters: Character[];
    /** Characters on the user's display. Characters that are also in [supportCharacter](#supportCharacter) are omitted if you use Enka.Network API. */
    readonly starfaringCompanions: Character[];
    readonly enkaProfile: EnkaProfile | null;
    readonly enkaUserHash: string | null;

    constructor(data: JsonObject, client: StarRail) {
        const json = new JsonReader(data);
        super(json);

        this.client = client;

        const detailInfo = json.get("detailInfo");

        this.uid = detailInfo.getAsNumberWithDefault(null, "uid") ?? Number(json.getValue("uid"));
        this.nickname = detailInfo.getAsString("nickname");
        this.signature = detailInfo.getAsStringWithDefault(null, "signature");

        this.icon = new UserIcon(detailInfo.getAsNumber("headIcon"), this.client);

        this.level = detailInfo.getAsNumber("level");
        this.equilibriumLevel = detailInfo.getAsNumberWithDefault(0, "worldLevel");

        const platform = detailInfo.getValue("platform");
        this.platform = typeof platform === "number" ? platformMap[platform] : typeof platform === "string" ? platform as Platform : null;

        this.friends = detailInfo.getAsNumberWithDefault(0, "friendCount");

        const recordInfo = detailInfo.get("recordInfo");

        this.achievementCount = recordInfo.getAsNumberWithDefault(0, "achievementCount");
        this.characterCount = recordInfo.getAsNumber("avatarCount");
        this.lightConeCount = recordInfo.getAsNumberWithDefault(0, "equipmentCount");
        this.bookCount = recordInfo.getAsNumberWithDefault(0, "bookCount");
        this.relicCount = recordInfo.getAsNumberWithDefault(0, "relicCount");
        this.musicCount = recordInfo.getAsNumberWithDefault(0, "musicCount");

        const challengeInfo = recordInfo.get("challengeInfo");
        this.challengeInfo = {
            level: challengeInfo.getAsNumberWithDefault(0, "abyssLevel"),
            stars: challengeInfo.getAsNumberWithDefault(0, "abyssStarCount"),
            forgottenHall: {
                memory: {
                    maxLevel: challengeInfo.getAsNumberWithDefault(0, "scheduleMaxLevel"),
                },
            },
        };

        this.simulatedUniverse = recordInfo.getAsNumberWithDefault(0, "maxRogueChallengeScore");

        this.isDisplayCharacter = detailInfo.getAsBoolean("isDisplayAvatar");

        const avatarDetailList = detailInfo.getAsJsonArrayWithDefault([], "avatarDetailList");
        this.starfaringCompanions = avatarDetailList.filter(c => !(c as JsonObject)["_assist"]).map(c => new Character(c as JsonObject, this.client));
        this.supportCharacters = (() => {
            // mihomo
            if (detailInfo.has("assistAvatarList")) return detailInfo.getAsJsonArray("assistAvatarList").map(c => new Character(c as JsonObject, this.client));

            // enka
            return avatarDetailList.filter(c => (c as JsonObject)["_assist"]).map(c => new Character(c as JsonObject, this.client));
        })();

        this.enkaUserHash = json.getAsStringWithDefault(null, "owner", "hash");
        this.enkaProfile = json.has("owner") ? new EnkaProfile(client.options.enkaSystem, json.getAsJsonObject("owner")) : null;
    }

    /**
     * You should use this method to get characters if you use Enka.Network API.
     */
    getCharacters(): Character[] {
        const characters = [...this.supportCharacters, ...this.starfaringCompanions];
        return Array.from(new Set(characters));
    }
}

export default StarRailUser;