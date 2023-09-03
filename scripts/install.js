const fs = require("fs");

const nocache = process.env.npm_config_sr_nocache;
const ghproxy = process.env.npm_config_sr_ghproxy;

if (nocache === "true" || nocache === "1") {
    if (!fs.existsSync("installed")) {
        // create a dummy file not to download the data on install other packages.
        fs.writeFileSync("installed", "");
    }
    return;
}

if (fs.existsSync("installed")) return;

const { StarRail } = require("..");
const client = new StarRail();

client.cachedAssetsManager._downloadCacheZip({ ghproxy: ghproxy === "true" || ghproxy === "1" });

fs.writeFileSync("installed", "");