import MihomoError from "./MihomoError";

/**
 * @en UserNotFoundError
 * @extends {MihomoError}
 */
class UserNotFoundError extends MihomoError {
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