import { Axios, AxiosResponse, AxiosRequestConfig } from "axios";
import StarRail from "../client/StarRail";
import { JsonObject } from "config_file.js";

const axios = new Axios({});

/**
 * @param url
 * @param client
 * @param enableTimeout
 */
export async function fetchJSON(url: string, client: StarRail, enableTimeout = false): Promise<AxiosResponse> {
    const headers: JsonObject = { "User-Agent": client.options.userAgent };
    if (client.options.githubToken && url.startsWith("https://api.github.com/")) headers["Authorization"] = `Bearer ${client.options.githubToken}`;

    const options: AxiosRequestConfig = { headers } as AxiosRequestConfig;
    if (enableTimeout) options.timeout = client.options.timeout;

    const res = await axios.get(url, options);

    try {
        res.data = JSON.parse(res.data);
    } catch (e) {
        // do not parse if it is not json due to some error
    }

    return res;
}
