const fs = require("fs");
const path = require("path");
const libsDir = path.join(".vercel", "output", "functions", "__server.func", "_libs");
const target = path.join(libsDir, "tslib.mjs");
const src = path.join("node_modules", "tslib", "tslib.es6.mjs");
if (fs.existsSync(libsDir) && fs.existsSync(src)) {
  fs.copyFileSync(src, target);
  console.log("[fix-tslib] Copied tslib.es6.mjs into _libs/tslib.mjs");
} else {
  console.log("[fix-tslib] No patch needed (libs dir or tslib source not found)");
}
