import { JsonObject, JsonReader } from "config_file.js";
import { User } from "enka-system";
import StarRail from "../client/StarRail";
import Character from "./character/Character";
import UserIcon from "./UserIcon";

/** @typedef */
export interface Birthday {
    month: number;
    day: number;
}

/** @typedef */
export type Platform = "PC" | "ANDROID" | "IOS" | "PS";

/** @typedef */
export interface PlayStationAccount {
    nickname: string;
    onlineId: string;
}

/** @extends {User} */
class StarRailUser extends User {
    /**  */
    readonly client: StarRail;

    /** This will be NaN if this StarRailUser is from [EnkaGameAccount](https://enka-system.vercel.app/docs/api/EnkaGameAccount) and [isUidPublic](https://enka-system.vercel.app/docs/api/EnkaGameAccount#isUidPublic) is `false`. */
    readonly uid: number;
    /**  */
    readonly nickname: string;
    /**  */
    readonly signature: string | null;
    /**  */
    readonly icon: UserIcon;
    /** Trailblaze level */
    readonly level: number;
    /** World level */
    readonly equilibriumLevel: number;
    /**  */
    readonly platform: Platform | null;
    /**  */
    readonly playStationAccount: PlayStationAccount | null;
    /**  */
    readonly friends: number;
    /**  */
    readonly achievements: number;
    /**  */
    readonly characterCount: number;
    /**  */
    readonly lightConeCount: number;
    /**  */
    readonly forgottenHall: number;
    /**  */
    readonly simulatedUniverse: number;
    /**  */
    readonly supportCharacter: Character | null;
    /** Characters on the user's display. The same character as [supportCharacter](#supportCharacter) is omitted if you use Enka.Network API. */
    readonly starfaringCompanions: Character[];
    /**  */
    readonly enkaUserHash: string | null;

    /**
     * @param data
     * @param client
     */
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

        let platform = detailInfo.getValue("platform");
        if (platform === 11) platform = "PS";
        this.platform = (platform ?? null) as Platform | null;

        this.playStationAccount = (detailInfo.has("platformAccountId") && detailInfo.has("platformNickname")) ? {
            nickname: detailInfo.getAsString("platformNickname"),
            onlineId: detailInfo.getAsString("platformAccountId"),
        } : null;

        this.friends = detailInfo.getAsNumberWithDefault(0, "friendCount");

        const recordInfo = detailInfo.get("recordInfo");

        this.achievements = recordInfo.getAsNumberWithDefault(0, "achievementCount");
        this.characterCount = recordInfo.getAsNumber("avatarCount");
        this.lightConeCount = recordInfo.getAsNumberWithDefault(0, "equipmentCount");

        this.forgottenHall = recordInfo.getAsNumberWithDefault(0, "challengeInfo", "scheduleMaxLevel");
        this.simulatedUniverse = recordInfo.getAsNumberWithDefault(0, "maxRogueChallengeScore");


        this.starfaringCompanions = detailInfo.getAsJsonArrayWithDefault([], "avatarDetailList").map(c => new Character(c as JsonObject, this.client));
        this.supportCharacter = (() => {
            if (detailInfo.has("assistAvatarDetail")) return new Character(detailInfo.getAsJsonObject("assistAvatarDetail"), this.client);
            const fromStarfaringCompanions = this.starfaringCompanions.find(c => c._data["_assist"]);
            if (fromStarfaringCompanions) {
                this.starfaringCompanions.splice(this.starfaringCompanions.indexOf(fromStarfaringCompanions), 1);
                return fromStarfaringCompanions;
            }

            return null;
        })();

        this.enkaUserHash = json.getAsStringWithDefault(null, "owner", "hash");

    }

    /**  */
    getCharacters(): Character[] {
        const characters = [...this.starfaringCompanions];
        const supportCharacter = this.supportCharacter;
        if (supportCharacter && characters.some(c => c.characterData.id === supportCharacter.characterData.id)) {
            characters.push(supportCharacter);
        }
        return characters;
    }
}

export default StarRailUser;