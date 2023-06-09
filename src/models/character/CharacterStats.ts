import { StatPropertyValue } from "../StatProperty";
import Character from "./Character";

/**
 * @en CharacterStats
 */
class CharacterStats {
    /**
     * @param character
     */
    constructor(character: Character) {
        const relicStatProperties: StatPropertyValue[] = character.relics.map(r => [{ statProperty: r.mainStat.mainStatData.statProperty, value: r.mainStat.value }, ...r.subStats.map(s => { return { statProperty: s.subStatData.statProperty, value: s.value }; })]).reduce((a, b) => [...a, ...b]);
        const lightConeStatProperties: StatPropertyValue[] = [...(character.lightCone?.basicStats ?? []), ...(character.lightCone?.extraStats ?? [])];
        // TODO: add stat properties
    }
}

export default CharacterStats;