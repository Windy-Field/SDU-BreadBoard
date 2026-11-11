import * as esbuild from "esbuild";
import fs from "node:fs";
import { complementPreset } from "../src/presets.mjs";

// 把界面和本地依赖合成普通脚本，让页面双击后也可以离线运行
async function buildApplication() {
    await esbuild.build({
        entryPoints: ["src/app.mjs"],
        bundle: true,
        outfile: "application.js",
        format: "iife",
        target: "es2020",
        minify: false,
        legalComments: "eof"
    });
    fs.mkdirSync("examples", { recursive: true });
    fs.writeFileSync("examples/complement-adder.json", JSON.stringify(complementPreset(), null, 2));
}

await buildApplication();
