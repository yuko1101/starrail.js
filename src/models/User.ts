import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";

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
    readonly birthday: Birthday | null;
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

        const birthday = playerDetailInfo.getAsNumberWithDefault(null, "Birthday");
        this.birthday = birthday ? { month: Math.floor(birthday / 100), day: birthday % 100 } : null;

        this.level = playerDetailInfo.getAsNumber("Level");
        this.equilibriumLevel = playerDetailInfo.getAsNumberWithDefault(0, "WorldLevel");
        this.friends = playerDetailInfo.getAsNumberWithDefault(0, "CurFriendCount");

        const playerSpaceInfo = playerDetailInfo.get("PlayerSpaceInfo");

        this.achievements = playerSpaceInfo.getAsNumberWithDefault(0, "AchievementCount");
        this.lightConeCount = playerSpaceInfo.getAsNumberWithDefault(0, "LightConeCount");
        this.characterCount = playerSpaceInfo.getAsNumber("AvatarCount");


    }
}

export default User;