import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import CharacterData from "./character/CharacterData";
import ImageAssets from "./assets/ImageAssets";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";
import Character from "./character/Character";

/** @typedef */
export interface Birthday {
    month: number;
    day: number;
}

/**
 * @en User
 */
class User {
    /**  */
    readonly client: StarRail;

    /**  */
    readonly uid: number;
    /**  */
    readonly nickname: string;
    /**  */
    readonly signature: string | null;
    /**  */
    readonly icon: ImageAssets;
    /**
     * The character used as the icon for the user
     * This will be null if the user is using non-character icon.
     */
    readonly iconCharacter: CharacterData | null;
    /** Trailblaze level */
    readonly level: number;
    /** World level */
    readonly equilibriumLevel: number;
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
    readonly supportCharacter: Character;
    /** Characters on the user's display */
    readonly starfaringCompanions: Character[];

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;

        this._data = data;

        const json = new JsonReader(this._data);
        const detailInfo = json.get("detailInfo");

        this.uid = detailInfo.getAsNumber("uid");
        this.nickname = detailInfo.getAsString("nickname");
        this.signature = detailInfo.getAsStringWithDefault(null, "signature");

        // head icon ids can be found in PlayerIcon.json, ItemPlayerCard.json, AvatarPlayerIcon.json, or ItemConfigAvatarPlayerIcon.json
        const headIconId = detailInfo.getAsNumber("headIcon");
        let headIcon = this.client.cachedAssetsManager.getStarRailCacheData("AvatarPlayerIcon")[headIconId];
        const isCharacterHeadIcon = !!headIcon;
        if (!headIcon) {
            const otherHeadIcon = this.client.cachedAssetsManager.getStarRailCacheData("PlayerIcon")[headIconId];
            if (!otherHeadIcon) throw new AssetsNotFoundError("HeadIcon", headIconId);
            headIcon = otherHeadIcon;
        }
        const headIconJson = new JsonReader(headIcon);

        this.icon = new ImageAssets(headIconJson.getAsString("ImagePath"), this.client);
        this.iconCharacter = isCharacterHeadIcon ? new CharacterData(headIconJson.getAsNumber("AvatarID"), this.client) : null;


        this.level = detailInfo.getAsNumber("level");
        this.equilibriumLevel = detailInfo.getAsNumberWithDefault(0, "worldLevel");
        this.friends = detailInfo.getAsNumberWithDefault(0, "friendCount");


        const recordInfo = detailInfo.get("recordInfo");

        this.achievements = recordInfo.getAsNumberWithDefault(0, "achievementCount");
        this.characterCount = recordInfo.getAsNumber("avatarCount");
        this.lightConeCount = recordInfo.getAsNumberWithDefault(0, "equipmentCount");

        this.forgottenHall = recordInfo.getAsNumberWithDefault(0, "challengeInfo", "scheduleMaxLevel");
        this.simulatedUniverse = recordInfo.getAsNumberWithDefault(0, "maxRogueChallengeScore");


        this.supportCharacter = new Character(detailInfo.getAsJsonObject("assistAvatarDetail"), this.client);
        this.starfaringCompanions = detailInfo.getAsJsonArrayWithDefault([], "avatarDetailList").map(c => new Character(c as JsonObject, this.client));

    }
}

export default User;