import StarRail from "../../client/StarRail";

/**
 * @typedef
 */
export interface ImageBaseUrl {
    filePath: "UPPER_CAMEL_CASE" | "LOWER_CASE" | "NONE",
    url: string,
    regexList: RegExp[],
    priority: number,
    format: "PNG" | "WEBP" | "JPG",
}

/**
 * @typedef
 */
export interface CustomImageBaseUrl extends ImageBaseUrl {
    /**
     * @param path path formatted by [ImageBaseUrl#filePath](ImageBaseUrl#filePath)
     * @returns parsed path
     */
    customParser: (path: string) => string,
}

/**
 * @en ImageAssets
 */
class ImageAssets {
    /**  */
    readonly client: StarRail;
    /**  */
    readonly path: string;

    /**  */
    readonly imageBaseUrl: ImageBaseUrl | null;
    /**  */
    readonly url: string;
    /**  */
    readonly isAvailable: boolean;

    /**
     * @param path
     * @param client
     */
    constructor(path: string, client: StarRail) {
        this.client = client;

        this.path = path;

        this.imageBaseUrl = [...client.options.imageBaseUrls].sort((a, b) => b.priority - a.priority).find(url => url.regexList.some(regex => regex.test(this.path))) ?? null;

        this.url = (() => {
            if (this.path === "" || this.imageBaseUrl == null) return "";
            const convertedPath = convertPathForImageBaseUrl(this.imageBaseUrl, this.path);
            if ("customParser" in this.imageBaseUrl) return `${this.imageBaseUrl.url}/${(this.imageBaseUrl as CustomImageBaseUrl).customParser(convertedPath)}`;
            return `${this.imageBaseUrl.url}/${convertedPath}`;
        })();

        this.isAvailable = this.url !== null && this.url !== undefined && this.url !== "";
    }
}

export default ImageAssets;

function convertPathForImageBaseUrl(imageBaseUrl: ImageBaseUrl, path: string): string {
    const split = path.split("/");
    switch (imageBaseUrl.filePath) {
        case "UPPER_CAMEL_CASE":
            return path;
        case "LOWER_CASE":
            return split.slice(0, -1).join("/").toLowerCase() + "/" + split.slice(-1)[0];
        case "NONE":
            return split.slice(-1)[0];
    }
}