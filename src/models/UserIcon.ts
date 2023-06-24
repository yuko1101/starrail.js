import { JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";
import ImageAssets from "./assets/ImageAssets";
import TextAssets from "./assets/TextAssets";
import CharacterData from "./character/CharacterData";

/**
 * @en UserIcon
 */
class UserIcon {
    /** This can be found in PlayerIcon.json, ItemPlayerCard.json, AvatarPlayerIcon.json, or ItemConfigAvatarPlayerIcon.json */
    readonly id: number;
    /**  */
    readonly client: StarRail;

    /**  */
    readonly name: TextAssets;
    /**  */
    readonly icon: ImageAssets;
    /** Available for some non-character icons. */
    readonly figureIcon: ImageAssets;
    /** This will be null if the icon is not of a character. */
    readonly characterData: CharacterData | null;

    /**
     * @param id
     * @param client
     */
    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        let headIcon = this.client.cachedAssetsManager.getStarRailCacheData("ItemConfigAvatarPlayerIcon")[this.id];
        const isCharacterHeadIcon = !!headIcon;
        if (!headIcon) {
            const otherHeadIcon = this.client.cachedAssetsManager.getStarRailCacheData("ItemPlayerCard")[this.id];
            if (!otherHeadIcon) throw new AssetsNotFoundError("UserIcon", this.id);
            headIcon = otherHeadIcon;
        }
        const headIconJson = new JsonReader(headIcon);

        this.name = new TextAssets(headIconJson.getAsNumber("ItemName", "Hash"), this.client);

        this.icon = new ImageAssets(headIconJson.getAsString("ItemIconPath"), this.client);
        this.figureIcon = new ImageAssets(headIconJson.getAsString("ItemFigureIconPath"), this.client);

        // TODO: better character id get (e.g. use AvatarPlayerIcon.json)
        this.characterData = isCharacterHeadIcon ? new CharacterData(this.id % 10000, this.client) : null;
    }
}

export default UserIcon;