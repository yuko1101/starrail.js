import { Axios, AxiosResponse, AxiosRequestConfig } from "axios";
import StarRail from "../client/StarRail";

const axios = new Axios({});

/**
 * @param url
 * @param client
 * @param enableTimeout
 */
export async function fetchJSON(url: string, client: StarRail, enableTimeout = false): Promise<AxiosResponse> {
    const options: AxiosRequestConfig = { headers: { "User-Agent": client.options.userAgent } };
    if (enableTimeout) options.timeout = client.options.timeout;

    const res = await axios.get(url, options);

    try {
        res.data = JSON.parse(res.data);
    } catch (e) {
        // do not parse if it is not json due to some error
    }

    return res;
}
