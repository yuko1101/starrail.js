import { JsonObject } from "config_file.js";
import StarRail from "../client/StarRail";

/**
 * @en User
 */
class User {
    /**  */
    readonly client: StarRail;

    readonly _data: JsonObject;

    /**
     * @param data
     * @param client
     */
    constructor(data: JsonObject, client: StarRail) {
        this.client = client;

        this._data = data;
    }
}

export default User;