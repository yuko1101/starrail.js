import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import CharacterData from "./character/CharacterData";
import ImageAssets from "./assets/ImageAssets";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";

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
    readonly birthday: Birthday | null;
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

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;

        this._data = data;

        // TODO: error handling (e.g. user does not exist)
        const json = new JsonReader(this._data);
        const playerDetailInfo = json.get("PlayerDetailInfo");

        this.uid = playerDetailInfo.getAsNumber("UID");
        this.nickname = playerDetailInfo.getAsString("NickName");
        this.signature = playerDetailInfo.getAsStringWithDefault(null, "Signature");

        const birthday = playerDetailInfo.getAsNumberWithDefault(null, "Birthday");
        this.birthday = birthday ? { month: Math.floor(birthday / 100), day: birthday % 100 } : null;

        // head icon ids can be found in PlayerIcon.json, ItemPlayerCard.json, AvatarPlayerIcon.json, or ItemConfigAvatarPlayerIcon.json
        const headIconId = playerDetailInfo.getAsNumber("HeadIconID");
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


        this.level = playerDetailInfo.getAsNumber("Level");
        this.equilibriumLevel = playerDetailInfo.getAsNumberWithDefault(0, "WorldLevel");
        this.friends = playerDetailInfo.getAsNumberWithDefault(0, "CurFriendCount");


        const playerSpaceInfo = playerDetailInfo.get("PlayerSpaceInfo");

        this.achievements = playerSpaceInfo.getAsNumberWithDefault(0, "AchievementCount");
        this.characterCount = playerSpaceInfo.getAsNumber("AvatarCount");
        this.lightConeCount = playerSpaceInfo.getAsNumberWithDefault(0, "LightConeCount");

        this.forgottenHall = playerSpaceInfo.getAsNumberWithDefault(0, "ChallengeData", "PreMazeGroupIndex");
        this.simulatedUniverse = playerSpaceInfo.getAsNumberWithDefault(0, "PassAreaProgress");

    }
}

export default User;