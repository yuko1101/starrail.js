export class AssetsNotFoundError extends Error {
    /** Category of assets */
    readonly category: string;
    /** Assets id */
    readonly id: string | number | bigint;

    constructor(category: string, id: string | number | bigint) {
        super(`${category} ${id} was not found. Try to update cached assets with StarRail#cachedAssetsManager#fetchAllContents`);
        this.name = "AssetsNotFoundError";
        this.category = category;
        this.id = id;
    }
}
