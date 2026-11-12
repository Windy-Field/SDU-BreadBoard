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

// 将原版 WebAssembly 转为数据地址，离线页面不需要 fetch 本地文件
function prepareRoutingRuntime() {
    const binary = fs.readFileSync("node_modules/libavoid-js/dist/libavoid.wasm");
    const address = "data:application/wasm;base64," + binary.toString("base64");
    const source = "// 构建生成的 libavoid 数据地址，不手动编辑\nexport const AVOID_WASM_URL = " + JSON.stringify(address) + ";\n";
    fs.writeFileSync("vendor/libavoid-wasm.mjs", source);
    fs.copyFileSync("node_modules/libavoid-js/LICENSE", "vendor/libavoid.LICENSE");
}

// 把界面和本地依赖合成普通脚本，让页面双击后也可以离线运行
async function buildApplication() {
    prepareRoutingRuntime();
    await esbuild.build(BUILD_OPTIONS);
    fs.mkdirSync(EXAMPLE_OUTPUT.directory, { recursive: true });
    fs.writeFileSync(EXAMPLE_OUTPUT.filename, JSON.stringify(complementPreset(), null, EXAMPLE_OUTPUT.indent));
    writeWiringGuide();
}

await buildApplication();
