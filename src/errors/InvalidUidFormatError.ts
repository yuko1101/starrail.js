import RequestError from "./RequestError";

/**
 * @en InvalidUidFormatError
 * @extends {RequestError}
 */
class InvalidUidFormatError extends RequestError {
    /**  */
    readonly uid: number;

    /**
     * @param uid
     * @param statusCode
     * @param statusMessage
     */
    constructor(uid: number, statusCode: number, statusMessage: string) {
        super(`Invalid uid format. (${uid} provided.)`, statusCode, statusMessage);

        this.name = "InvalidUidFormatError";
        this.uid = uid;
    }
}

export default InvalidUidFormatError;