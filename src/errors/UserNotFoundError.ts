import APIError from "./APIError";

/**
 * @en UserNotFoundError
 * @extends {APIError}
 */
class UserNotFoundError extends APIError {
    /**  */
    readonly uid: number;

    /**
     * @param uid
     */
    constructor(uid: number) {
        super(`The user with uid ${uid} was not found.`);

        this.name = "UserNotFoundError";
        this.uid = uid;
    }
}

export default UserNotFoundError;