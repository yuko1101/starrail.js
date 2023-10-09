# StarRail.js

![StarRail.js](https://github.com/yuko1101/starrail.js/blob/main/docs/static/img/starrail-social-card.png?raw=true)

<div align="center">
	<p>
		<a href="https://www.npmjs.com/package/starrail.js"><img src="https://img.shields.io/npm/v/starrail.js.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/starrail.js"><img src="https://img.shields.io/npm/dt/starrail.js.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/yuko1101/starrail.js/actions/workflows/codeql.yml"><img src="https://github.com/yuko1101/starrail.js/actions/workflows/codeql.yml/badge.svg"/></a>
    	<a href="https://github.com/yuko1101/starrail.js/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg"/></a>
	</p>
</div>

<div align="center">
    <a href="https://starrail.vercel.app/docs/api/StarRail">
        <b>&lt;/&gt; Documentation</b>
    </a>
    <b> | </b>
    <a href="https://www.npmjs.com/package/starrail.js">
        <b>⚙ NPM</b>
    </a>
    <b> | </b>
    <i class="fab fa-github"></i>
    <a href="https://github.com/yuko1101/starrail.js">
        <b> GitHub</b>
    </a>
</div>

## About

A Node.js Enka.Network API wrapper for Honkai: Star Rail.

### Features
- User Data and Character Stats by UID with Enka.Network API (or with MiHoMo API).
- All Characters and All Light Cones Data.
- Cache Updater for the new update of Honkai: Star Rail. (Update characters and light cones immediately.)


## Installation

**Node.js 16 or newer is required.**

Install starrail.js including Star Rail cache data.
```sh-session
npm install starrail.js@latest
```
<details>
    <summary>Install using ghproxy.com</summary>
    
    npm install starrail.js@latest --sr-ghproxy=true
</details>
<br/>

If you have already moved the cache to another folder, you can also install without downloading the cache.
```sh-session
npm install starrail.js@latest --sr-nocache=true
```

## About Star Rail Cache Data
Star Rail cache data is from [Dimbreath/StarRailData](https://github.com/Dimbreath/StarRailData)

This data contains data of characters, light cones, materials, and more structure information of Star Rail.

You can change your cache directory.
```js
const { StarRail } = require("starrail.js");

// Change the directory to store cache data.
// Default directory is node_modules/starrail.js/cache.
const client = new StarRail();
client.cachedAssetsManager.cacheDirectoryPath = "./cache";
client.cachedAssetsManager.cacheDirectorySetup();

// OR

const client = new StarRail({ cacheDirectory: "./cache" });
client.cachedAssetsManager.cacheDirectorySetup();

```

### Updating

You can update your Star Rail cache data.
```js
const { StarRail } = require("starrail.js");
const client = new StarRail({ showFetchCacheLog: true }); // showFetchCacheLog is true by default

client.cachedAssetsManager.fetchAllContents(); // returns promise
```


Also, you can activate auto cache updater.

When using the auto-cache updater, we recommend moving the cache directory directly under your project folder.

```js
const { StarRail } = require("starrail.js");
const client = new StarRail();

client.cachedAssetsManager.activateAutoCacheUpdater({
    instant: true, // Run the first update check immediately
    timeout: 60 * 60 * 1000, // 1 hour interval
    onUpdateStart: async () => {
        console.log("Updating Star Rail Data...");
    },
    onUpdateEnd: async () => {
        client.cachedAssetsManager.refreshAllData(); // Refresh memory
        console.log("Updating Completed!");
    }
});

// // deactivate
// client.cachedAssetsManager.deactivateAutoCacheUpdater();
```

# Where is the image file for ImageAssets?
As far as I know, there are few cdns for starrail. So, this library cannot provide urls of some images and ImageAssets#url is often unavailable. But **you can extract image files from StarRail Game Data** with HoyoStudio or something else.

If you would like ImageAssets#url to show the paths to your extracted images, you can use `imageBaseUrls` option.
```js
const { StarRail } = require("starrail.js");
const client = new StarRail();

client.options.imageBaseUrls.push(
    {
        regexList: [/.*/], // for all images
        /*  
          "LOWER_CASE" if the names of folders in your extracted directory are in lowercase. e.g. "spriteoutput/itemicon/relicicons/IconRelic_101_1.png"
          "UPPER_CAMEL_CASE" if the names of folders in your extracted directory are in upper camel case. e.g. "SpriteOutput/ItemIcon/RelicIcons/IconRelic_101_1.png"
          "NONE" if your extracted files are not grouped in folders. e.g. "IconRelic_101_1.png"
        */
        filePath: "LOWER_CASE",
        priority: 10,
        url: "Your directory path to assets/asbres", // path to directory of extracted files
    }
);

```

# How to use

## Fetching Player Data
[StarRail#fetchUser](https://starrail.vercel.app/docs/api/StarRail#fetchUser)
```js
const { StarRail } = require("starrail.js");
const client = new StarRail();

client.fetchUser(800069903).then(user => {
  console.log(user);
});
```

## Star Rail Character List
[StarRail#getAllCharacters](https://starrail.vercel.app/docs/api/StarRail#getAllCharacters)
```js
const { StarRail } = require("starrail.js");
const client = new StarRail();

const characters = client.getAllCharacters();
// print character names in language "en"
console.log(characters.map(c => c.name.get("en")));
```

## Star Rail Light Cone List
[StarRail#getAllLightCones](https://starrail.vercel.app/docs/api/StarRail#getAllLightCones)
```js
const { StarRail } = require("starrail.js");
const client = new StarRail();

const lightCones = client.getAllLightCones();
// print light cone names in language "jp"
console.log(lightCones.map(w => w.name.get("jp")));
```

More examples are available in [example](https://github.com/yuko1101/starrail.js/tree/main/example) folder.

For more information, please check [Documentation](https://starrail.vercel.app/docs/api/StarRail).

You can see the changelog [here](https://github.com/yuko1101/starrail.js/blob/main/CHANGELOG.md).
