import { JsonObject, JsonReader } from "config_file.js";
import StarRail from "../client/StarRail";
import AssetsNotFoundError from "../errors/AssetsNotFoundError";
import ImageAssets from "./assets/ImageAssets";
import TextAssets from "./assets/TextAssets";
import CharacterData from "./character/CharacterData";

class UserIcon {
    /** This can be found in PlayerIcon.json, ItemPlayerCard.json, AvatarPlayerIcon.json, or ItemConfigAvatarPlayerIcon.json */
    readonly id: number;
    readonly client: StarRail;
    readonly _itemData: JsonObject;
    readonly _iconData: JsonObject;

    readonly name: TextAssets;
    readonly icon: ImageAssets;
    readonly itemIcon: ImageAssets;
    /** Available for some non-character icons. */
    readonly figureIcon: ImageAssets;
    /** This will be null if the icon is not of a character. */
    readonly characterData: CharacterData | null;

    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        let playerIconItem = this.client.cachedAssetsManager.getStarRailCacheData("ItemConfigAvatarPlayerIcon")[this.id];
        const isCharacterIcon = !!playerIconItem;
        if (!playerIconItem) {
            const otherPlayerIcon = this.client.cachedAssetsManager.getStarRailCacheData("ItemPlayerCard")[this.id];
            if (!otherPlayerIcon) throw new AssetsNotFoundError("UserIcon-Item", this.id);
            playerIconItem = otherPlayerIcon;
        }
        const itemJson = new JsonReader(playerIconItem);
        this._itemData = itemJson.getAsJsonObject();

        const playerIcon = this.client.cachedAssetsManager.getStarRailCacheData(isCharacterIcon ? "AvatarPlayerIcon" : "PlayerIcon")[this.id];
        if (!playerIcon) throw new AssetsNotFoundError("UserIcon-Icon", this.id);
        const iconJson = new JsonReader(playerIcon);
        this._iconData = iconJson.getAsJsonObject();

        this.name = new TextAssets(itemJson.getAsNumber("ItemName", "Hash"), this.client);

        this.icon = new ImageAssets(iconJson.getAsString("ImagePath"), this.client);
        this.itemIcon = new ImageAssets(itemJson.getAsString("ItemIconPath"), this.client);
        this.figureIcon = new ImageAssets(itemJson.getAsString("ItemFigureIconPath"), this.client);

        this.characterData = isCharacterIcon ? new CharacterData(iconJson.getAsNumber("AvatarID"), this.client) : null;
    }
}

export default UserIcon;