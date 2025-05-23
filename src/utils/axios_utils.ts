import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { StarRail } from "../client/StarRail";
import { JsonObject } from "config_file.js";
import jsonBigint from "json-bigint";
const JSONBig = jsonBigint({ useNativeBigInt: true });

// do not transform response
const transformResponse = [(data: string) => data];

export async function fetchJSON(url: string, client: StarRail, enableTimeout = false, parseBigint = false): Promise<AxiosResponse> {
    const headers: JsonObject = { "User-Agent": client.options.userAgent };
    if (client.options.githubToken && url.startsWith("https://api.github.com/")) headers["Authorization"] = `Bearer ${client.options.githubToken}`;

    const options: AxiosRequestConfig = { headers, transformResponse } as AxiosRequestConfig;
    if (enableTimeout) options.timeout = client.options.requestTimeout;

    const res: AxiosResponse = await (async () => {
        try {
            return await axios.get(url, options);
        } catch (e) {
            if (typeof e === "object" && e && "response" in e) return e.response as AxiosResponse;
            else throw e;
        }
    })();


    if (res.data) {
        try {
            res.data = parseBigint ? JSONBig.parse(res.data) : JSON.parse(res.data);
        } catch {
            // do not parse if it is not json due to some error
        }
    }

    return res;
}

