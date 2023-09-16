import APIError from "./APIError";

/**
 * @en RequestError
 * @extends {APIError}
 */
class RequestError extends APIError {
    /** HTTP response status code */
    readonly statusCode: number;
    /** The message of the status code */
    readonly statusMessage: string;

    /**
     * @param message
     * @param statusCode
     * @param statusMessage
     */
    constructor(message: string, statusCode: number, statusMessage: string) {
        super(message);

        this.name = "RequestError";

        this.statusCode = statusCode;

        this.statusMessage = statusMessage;
    }
}

export default RequestError;