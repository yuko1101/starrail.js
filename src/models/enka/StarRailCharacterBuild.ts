import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../../client/StarRail";
import Character from "../character/Character";

/**
 * @en StarRailCharacterBuild
 */
class StarRailCharacterBuild {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly enkaUserInfo: { username: string, hash: string };

    /**  */
    readonly id: number;
    /**  */
    readonly name: string;
    /**  */
    readonly order: number;
    /**  */
    readonly isLive: boolean;
    /**  */
    readonly isPublic: boolean;
    /**  */
    readonly character: Character;
    /**  */
    readonly url: string;

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     * @param username
     * @param hash
     */
    constructor(data: JsonObject, client: StarRail, username: string, hash: string) {

        this._data = data;

        this.client = client;

        this.enkaUserInfo = { username: username, hash: hash };

        const json = new JsonReader(this._data);

        this.id = json.getAsNumber("id");

        this.name = json.getAsString("name");

        this.order = json.getAsNumber("order");

        this.isLive = json.getAsBoolean("live");

        this.isPublic = json.getAsBoolean("public");

        this.character = new Character(json.getAsJsonObject("avatar_data"), client);

        this.url = `https://enka.network/u/${this.enkaUserInfo.username}/${this.enkaUserInfo.hash}/${this.character.characterData.id}/${this.id}`;
    }
}

export default StarRailCharacterBuild;