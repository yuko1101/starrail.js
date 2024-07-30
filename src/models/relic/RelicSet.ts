import { JsonObject, JsonReader, separateByValue } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { TextAssets } from "../assets/TextAssets";
import { ImageAssets } from "../assets/ImageAssets";
import { RelicSetBonus } from "./RelicSetBonus";
import { Relic } from "./Relic";
import { RelicData } from "./RelicData";

export class RelicSet {
    readonly id: number;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly icon: ImageAssets;
    readonly figureIcon: ImageAssets;
    readonly setBonus: RelicSetBonus[];

    readonly _data: JsonObject;

    constructor(id: number, client: StarRail) {
        this.id = id;
        this.client = client;

        const _data = client.cachedAssetsManager.getExcelData("RelicSetConfig", this.id);
        if (!_data) throw new AssetsNotFoundError("RelicSet", this.id);
        this._data = _data;

        const json = new JsonReader(this._data);

        this.name = new TextAssets(json.getAsNumber("SetName", "Hash"), this.client);

        this.icon = new ImageAssets(json.getAsString("SetIconPath"), this.client);
        this.figureIcon = new ImageAssets(json.getAsString("SetIconFigurePath"), this.client);

        this.setBonus = json.get("SetSkillList").mapArray((_, needCount) => new RelicSetBonus(this.id, needCount.getAsNumber(), this.client));
    }

    static getActiveSetBonus(relics: (Relic | RelicData | RelicSet)[]): { set: RelicSet, count: number, activeBonus: RelicSetBonus[] }[] {
        const relicSets = relics.map(a => (a instanceof RelicSet) ? a : (a instanceof RelicData) ? a.set : a.relicData.set);

        const separated = separateByValue(relicSets, a => a.id.toString());

        const relicSetCounts = Object.values(separated).map(array => { return { count: array.length, set: array[0] }; });

        return relicSetCounts.map(obj => {
            return {
                set: obj.set,
                count: obj.count,
                activeBonus: obj.set.setBonus.filter(bonus => bonus.needCount <= obj.count),
            };
        }).sort((a, b) => b.count - a.count);
    }
}
