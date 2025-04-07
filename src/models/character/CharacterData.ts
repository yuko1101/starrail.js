import { JsonObject, JsonReader } from "config_file.js";
import { StarRail } from "../../client/StarRail";
import { AssetsNotFoundError } from "../../errors/AssetsNotFoundError";
import { TextAssets } from "../assets/TextAssets";
import { CombatType, CombatTypeId } from "../CombatType";
import { Path, PathId } from "../Path";
import { Skill } from "./skill/Skill";
import { ImageAssets } from "../assets/ImageAssets";
import { SkillTreeNode } from "./skill/SkillTreeNode";
import { Eidolon } from "./Eidolon";
import { StatPropertyValue } from "../StatProperty";
import { SimpleMap, SimpleObject, getKeysFromSimpleMap } from "../../utils/ts_utils";
import { excelJsonOptions } from "../../client/CachedAssetsManager";

export class CharacterData {
    readonly id: number;
    readonly client: StarRail;

    readonly name: TextAssets;
    readonly description: TextAssets;
    readonly stars: number;
    readonly maxEnergy: number | null;
    readonly combatType: CombatType;
    readonly path: Path;
    readonly skills: Skill[];
    readonly skillTreeNodes: SkillTreeNode[];
    readonly eidolons: Eidolon[];
    readonly icon: ImageAssets;
    readonly sideIcon: ImageAssets;
    readonly miniIcon: ImageAssets;
    readonly teamActionIcon: ImageAssets;
    readonly teamWaitingIcon: ImageAssets;
    readonly splashImage: ImageAssets;
    readonly splashCutInFigureImage: ImageAssets;
    readonly splashCutInBackgroundImage: ImageAssets;
    readonly shopItemIcon: ImageAssets;

    readonly _data: JsonObject;
    readonly _itemData: JsonObject;

    constructor(id: number, client: StarRail) {
        this.id = id;

        this.client = client;

        const _data: JsonObject | undefined = client.cachedAssetsManager._getExcelData("AvatarConfig")[this.id];
        if (!_data) throw new AssetsNotFoundError("Character", this.id);
        this._data = _data;

        const _itemData = client.cachedAssetsManager.getExcelData("ItemConfigAvatar", this.id);
        if (!_itemData) throw new AssetsNotFoundError("Character Item", this.id);
        this._itemData = _itemData;

        const json = new JsonReader(excelJsonOptions, this._data);
        const itemJson = new JsonReader(excelJsonOptions, this._itemData);

        this.name = new TextAssets(json.getAsNumberOrBigint("AvatarName", "Hash"), this.client);
        this.description = new TextAssets(itemJson.getAsNumberOrBigint("ItemBGDesc", "Hash"), this.client);

        this.stars = Number(json.getAsString("Rarity").slice(-1));

        this.maxEnergy = json.getAsNumberWithDefault(null, "SPNeed", "Value");

        this.combatType = new CombatType(json.getAsString("DamageType") as CombatTypeId, this.client);

        this.path = new Path(json.getAsString("AvatarBaseType") as PathId, this.client);

        this.skills = json.get("SkillList").mapArray((_, skillId) => new Skill(skillId.getAsNumber(), this.client));

        const skillTreeData = this.client.cachedAssetsManager._getExcelData("AvatarSkillTreeConfig");
        const skillTreeJson = new JsonReader(excelJsonOptions, skillTreeData);
        this.skillTreeNodes = skillTreeJson.filterObject((_, node) => node.getAsNumber("1", "AvatarID") === this.id).map(([nodeId]) => new SkillTreeNode(Number(nodeId), this.client));

        const eidolonsData = this.client.cachedAssetsManager._getExcelData("AvatarRankConfig");
        const eidolonsJson = new JsonReader(excelJsonOptions, eidolonsData);
        this.eidolons = eidolonsJson.filterObject((eidolonId) => Math.floor(Number(eidolonId) / 100) === this.id).map(([eidolonId]) => new Eidolon(Number(eidolonId), this.client));

        this.icon = new ImageAssets(json.getAsString("DefaultAvatarHeadIconPath"), this.client);
        this.sideIcon = new ImageAssets(json.getAsString("AvatarSideIconPath"), this.client);
        this.miniIcon = new ImageAssets(json.getAsString("AvatarMiniIconPath"), this.client);
        this.teamActionIcon = new ImageAssets(json.getAsString("ActionAvatarHeadIconPath"), this.client);
        this.teamWaitingIcon = new ImageAssets(json.getAsString("WaitingAvatarHeadIconPath"), this.client);
        this.splashImage = new ImageAssets(json.getAsString("AvatarCutinFrontImgPath"), this.client);
        this.splashCutInFigureImage = new ImageAssets(json.getAsString("AvatarCutinImgPath"), this.client);
        this.splashCutInBackgroundImage = new ImageAssets(json.getAsString("AvatarCutinBgImgPath"), this.client);
        this.shopItemIcon = new ImageAssets(itemJson.getAsString("ItemAvatarIconPath"), this.client);
    }

    getStatsByLevel(ascension: number, level: number): StatPropertyValue[] {
        const ascensionData = this.client.cachedAssetsManager._getExcelData("AvatarPromotionConfig")[this.id][ascension];
        const ascensionJson = new JsonReader(excelJsonOptions, ascensionData);

        return [
            new StatPropertyValue("BaseAttack", ascensionJson.getAsNumber("AttackBase", "Value") + ascensionJson.getAsNumber("AttackAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseDefence", ascensionJson.getAsNumber("DefenceBase", "Value") + ascensionJson.getAsNumber("DefenceAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseHP", ascensionJson.getAsNumber("HPBase", "Value") + ascensionJson.getAsNumber("HPAdd", "Value") * (level - 1), this.client),
            new StatPropertyValue("BaseSpeed", ascensionJson.getAsNumber("SpeedBase", "Value"), this.client),
            new StatPropertyValue("CriticalChanceBase", ascensionJson.getAsNumber("CriticalChance", "Value"), this.client),
            new StatPropertyValue("CriticalDamageBase", ascensionJson.getAsNumber("CriticalDamage", "Value"), this.client),
        ];
    }

    getSkillTreeIdMap(): SimpleObject<never> {
        const skillTreeMap = this.getSkillTreeMap();
        const skillTreeIdMap: SimpleObject<never> = {};

        function convertKeyIntoId(map: SimpleMap<SkillTreeNode, never>, obj: SimpleObject<never>) {
            map.forEach((_, key) => {
                obj[key.id] = {};
                if (map.get(key) instanceof Map) {
                    convertKeyIntoId(map.get(key) as SimpleMap<SkillTreeNode, never>, obj[key.id]);
                }
            });
        }

        convertKeyIntoId(skillTreeMap, skillTreeIdMap);

        return skillTreeIdMap;
    }

    getSkillTreeMap(): SimpleMap<SkillTreeNode, never> {
        const skillTreeMap: SimpleMap<SkillTreeNode, never> = new Map();
        const skillTreeNodes = this.skillTreeNodes;
        const routes: SkillTreeNode[][] = [];
        for (const node of skillTreeNodes) {
            const route = getSkillTreeRoute(skillTreeNodes, node);
            route.push(node);
            routes.push(route);
        }

        for (const route of routes) {
            let map = skillTreeMap;
            for (let i = 0; i < route.length; i++) {
                const key = route[i];
                if (!map.has(key)) {
                    map.set(key, new Map());
                }
                map = map.get(key) as SimpleMap<SkillTreeNode, never>;
            }
        }
        return skillTreeMap;
    }

    /**
     * @returns array of group of SkillTreeNode, which is grouped by the structure of skill tree
     */
    getGroupedSkillTreeNodes(): SkillTreeNode[][] {
        const skillTreeMap = this.getSkillTreeMap();

        const groupedSkillTreeNodes: SkillTreeNode[][] = [];

        const otherNodes: SkillTreeNode[] = [];
        skillTreeMap.forEach((value, key) => {
            if (value.size === 0) {
                if (!key.isUnlockedByDefault) otherNodes.push(key);
                return;
            }
            const group: SkillTreeNode[] = getKeysFromSimpleMap(value);
            group.unshift(key);
            groupedSkillTreeNodes.push(group);
        });

        return [otherNodes, ...groupedSkillTreeNodes];
    }

    getBaseAggro(ascension: number): number {
        const ascensionData = this.client.cachedAssetsManager._getExcelData("AvatarPromotionConfig")[this.id][ascension];
        const ascensionJson = new JsonReader(excelJsonOptions, ascensionData);

        return ascensionJson.getAsNumber("BaseAggro", "Value");
    }
}

function getSkillTreeRoute(nodes: SkillTreeNode[], target: SkillTreeNode, route: SkillTreeNode[] = []): SkillTreeNode[] {
    const preNodeId = target.previousNodeId;
    if (preNodeId === null) return route;
    const preNode = nodes.find(node => node.id === preNodeId) as SkillTreeNode;
    return getSkillTreeRoute(nodes, preNode, [preNode, ...route]);
}

