const fs = require("fs");

const nocache = process.env.npm_config_sr_nocache;
const ghproxy = process.env.npm_config_sr_ghproxy;

if (nocache === "true" || nocache === "1") {
    if (!fs.existsSync("cache")) {
        // create folder not to download the data when install other packages.
        fs.mkdirSync("cache");
    }
    return;
}

if (fs.existsSync("cache")) return;

const { StarRail } = require("..");
const client = new StarRail();

client.cachedAssetsManager._downloadCacheZip({ ghproxy: ghproxy === "true" || ghproxy === "1" });