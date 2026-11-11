import * as esbuild from "esbuild";
import fs from "node:fs";
import { complementPreset } from "../src/presets.mjs";
import { writeWiringGuide } from "./wiring-guide.mjs";

// 离线脚本的构建目标与输出路径，修改入口时在这里统一调整
const BUILD_OPTIONS = {
    entryPoints: ["src/app.mjs"],
    bundle: true,
    outfile: "application.js",
    format: "iife",
    target: "es2020",
    minify: false,
    legalComments: "eof"
};
// 示例文件的输出目录、文件名与 JSON 缩进
const EXAMPLE_OUTPUT = { directory: "examples", filename: "examples/complement-adder.json", indent: 2 };

// 把界面和本地依赖合成普通脚本，让页面双击后也可以离线运行
async function buildApplication() {
    await esbuild.build(BUILD_OPTIONS);
    fs.mkdirSync(EXAMPLE_OUTPUT.directory, { recursive: true });
    fs.writeFileSync(EXAMPLE_OUTPUT.filename, JSON.stringify(complementPreset(), null, EXAMPLE_OUTPUT.indent));
    writeWiringGuide();
}

await buildApplication();
