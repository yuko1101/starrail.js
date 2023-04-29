import { bindOptions } from "config_file.js";

/** @typedef */
export interface ClientOptions {
    userAgent: string,
}

/**
 * @en StarRail
 */
class StarRail {
    /** The options the client was instantiated with */
    readonly options: ClientOptions;

    /**
     * @param options
     */
    constructor(options: Partial<ClientOptions>) {
        this.options = bindOptions({
            userAgent: "Mozilla/5.0",
        }, options) as unknown as ClientOptions;
    }
}

export default StarRail;