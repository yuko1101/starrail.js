/**
 * @en MihomoError
 * @extends {Error}
 */
class APIError extends Error {
    /**
     * @param message
     */
    constructor(message: string) {
        super(message);
    }
}

export default APIError;