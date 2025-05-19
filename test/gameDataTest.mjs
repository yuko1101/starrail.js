import test from "node:test";
import assert from "node:assert";
import { StarRail, languages } from "../dist/index.js";

const sr = new StarRail({ defaultLanguage: "en", cacheDirectory: "./cache" });
const useRawStarRailData = false;
if (!sr.cachedAssetsManager.hasAllContents() || await sr.cachedAssetsManager.checkForUpdates(useRawStarRailData)) {
  await sr.cachedAssetsManager.fetchAllContents({ useRawStarRailData });
  sr.cachedAssetsManager.refreshAllData();
  console.log("Assets updated!");
}

const characters = sr.getAllCharacters();
const lightCones = sr.getAllLightCones();
const relics = sr.getAllRelics();

function showStatistics() {
  console.log("[Excel Statistics]");
  console.log("Characters:", characters.length);
  console.log("Light Cones:", lightCones.length);
  console.log("Relics:", relics.length);

  console.log();

  console.log("[TextMap Statistics]");
  for (const lang of languages) {
    const map = sr.cachedAssetsManager.getLanguageData(lang);
    console.log(`TextMap ${lang}:`, Object.keys(map).length);
  }

  console.log();
}

showStatistics();

/**
 * @param {import("..").TextAssets} textAssets
 * @param {string} from
 */
const assertValidTextAssets = (textAssets, from = "unknown") => {
  for (const lang of languages) {
    const text = textAssets.getNullable(lang);
    assert.ok(text && text.length > 0, `Text asset ${textAssets.id} (from ${from}) has no text for language ${lang}`);
  }
};

test("Character Names", () => {
  for (const character of characters) {
    assertValidTextAssets(character.name, `Character(${character.id}).name`);
  }
});

test("Character Base Stats", () => {
  for (const character of characters) {
    const baseStats = character.getStatsByLevel(6, 80);
    assert.ok(baseStats && baseStats.length > 0, `Character ${character.id} has no base stats`);
  }
});

test("Character Eidolons", () => {
  for (const character of characters) {
    for (const eidolon of character.eidolons) {
      assertValidTextAssets(eidolon.name, `Character(${character.id}).eidolon(${eidolon.id}).name`);
      assertValidTextAssets(eidolon.description, `Character(${character.id}).eidolon(${eidolon.id}).description`);
      if (eidolon.rank === 3 || eidolon.rank === 5) {
        assert.ok(Object.keys(eidolon.skillsLevelUp).length > 0, `Character(${character.id}).eidolon(${eidolon.id}).skillsLevelUp is empty`);
      } else {
        assert.ok(Object.keys(eidolon.skillsLevelUp).length === 0, `Character(${character.id}).eidolon(${eidolon.id}).skillsLevelUp is not empty`);
      }
    }
  }
});

test("LightCone Names", () => {
  for (const lightCone of lightCones) {
    assertValidTextAssets(lightCone.name, `LightCone(${lightCone.id}).name`);
  }
});

test("LightCone Base Stats", () => {
  for (const lightCone of lightCones) {
    const baseStats = lightCone.getStatsByLevel(1, 1);
    assert.ok(baseStats && baseStats.length > 0, `LightCone ${lightCone.id} has no base stats`);
  }
});

test("LightCone Superimpositions", () => {
  for (const lightCone of lightCones) {
    for (const superimposition of lightCone.superimpositions) {
      assertValidTextAssets(superimposition.name, `LightCone(${lightCone.id}).superimposition(${superimposition.id}).name`);
      assertValidTextAssets(superimposition.description, `LightCone(${lightCone.id}).superimposition(${superimposition.id}).description`);
    }
  }
});

test("Relic Names", () => {
  for (const relic of relics) {
    assertValidTextAssets(relic.name, `Relic(${relic.id}).name`);
  }
});
