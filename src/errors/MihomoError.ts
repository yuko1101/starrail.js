/**
 * @en MihomoError
 * @extends {Error}
 */
class MihomoError extends Error {
    /**
     * @param message
     */
    constructor(message: string) {
        super(message);
    }
}

export default MihomoError;