import MihomoError from "./MihomoError";

/**
 * @en InvalidUidFormatError
 * @extends {MihomoError}
 */
class InvalidUidFormatError extends MihomoError {
    /**  */
    readonly uid: number;

    /**
     * @param uid
     */
    constructor(uid: number) {
        super(`Invalid uid format. (${uid} provided.)`);

        this.name = "InvalidUidFormatError";
        this.uid = uid;
    }
}

export default InvalidUidFormatError;