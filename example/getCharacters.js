const { StarRail } = require("starrail.js");
const client = new StarRail({ defaultLanguage: "en" });

const characters = client.getAllCharacters();

for (const character of characters) {
    const name = character.name.get();
    const combatType = character.combatType.name.get();

    console.log(`"${name}" - ${combatType}`);
}
/* Example output:
"March 7th" - Ice
"Dan Heng" - Wind
"Himeko" - Fire
"Welt" - Imaginary
"Kafka" - Lightning
"Silver Wolf" - Quantum
"Arlan" - Lightning
"Asta" - Fire
"Herta" - Ice
"Bronya" - Wind
"Seele" - Quantum
"Serval" - Lightning
"Gepard" - Ice
"Natasha" - Physical
"Pela" - Ice
"Clara" - Physical
"Sampo" - Wind
"Hook" - Fire
"Qingque" - Quantum
"Tingyun" - Lightning
"Luocha" - Imaginary
"Jing Yuan" - Lightning
"Sushang" - Physical
"Yanqing" - Ice
"Bailu" - Lightning
"{NICKNAME}" - Physical
"{NICKNAME}" - Physical
"{NICKNAME}" - Fire
"{NICKNAME}" - Fire
 */