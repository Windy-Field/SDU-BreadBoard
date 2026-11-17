import * as esbuild from "esbuild";
import fs from "node:fs";
import { complementPreset } from "../src/experiments/presets.mjs";
import { ramPreset } from "../src/experiments/ram-preset.mjs";
import { writeWiringGuide, writeRamGuide } from "./wiring-guide.mjs";
import { APP_VERSION } from "../src/version.mjs";

// 离线脚本的构建目标与输出路径，修改入口时在这里统一调整
const BUILD_OPTIONS = {
    entryPoints: ["src/app.mjs"],
    bundle: true,
    outfile: "application.js",
    format: "iife",
    target: "es2020",
    minify: false,
    external: ["libavoid-js", "elkjs/lib/elk.bundled.js"],
    legalComments: "eof"
};
// 重型引擎独立为普通浏览器脚本，保持file协议离线兼容，不使用模块拆包
const ROUTING_BUILD_OPTIONS = {
    entryPoints: ["src/board/routing-browser.mjs"],
    bundle: true,
    outfile: "vendor/routing-runtime.js",
    globalName: "BreadboardRouting",
    format: "iife",
    target: "es2020",
    minify: false,
    legalComments: "eof"
};
// 示例文件的输出目录、文件名与 JSON 缩进
const EXAMPLE_OUTPUT = { directory: "examples", filename: "examples/complement-adder.json", indent: 2 };
const RAM_EXAMPLE_OUTPUT = "examples/ram-expansion.json";
// 页面版本与脚本缓存标记随发布版本同步，加载脚本前也显示正确版本
const PAGE_OUTPUT = "index.html";

// 同步页面默认版本和脚本地址，版本号只从版本模块读取
function updatePageVersion() {
    const source = fs.readFileSync(PAGE_OUTPUT, "utf8");
    const footer = /(<span id="app-version">)v[0-9.]+(<\/span>)/;
    const script = /src="application\.js(?:\?v=[0-9.]+)?"/;
    if (!footer.test(source) || !script.test(source)) {
        throw new Error("页面缺少版本显示或运行脚本入口");
    }
    const updatedFooter = source.replace(footer, "$1v" + APP_VERSION + "$2");
    const updatedPage = updatedFooter.replace(script, 'src="application.js?v=' + APP_VERSION + '"');
    if (updatedPage !== source) {
        fs.writeFileSync(PAGE_OUTPUT, updatedPage);
    }
}

// 将原版 WebAssembly 转为数据地址，离线页面不需要 fetch 本地文件
function prepareRoutingRuntime() {
    const binary = fs.readFileSync("node_modules/libavoid-js/dist/libavoid.wasm");
    const address = "data:application/wasm;base64," + binary.toString("base64");
    const source = "// 构建生成的 libavoid 数据地址，不手动编辑\nexport const AVOID_WASM_URL = " + JSON.stringify(address) + ";\n";
    fs.writeFileSync("vendor/libavoid-wasm.mjs", source);
    fs.copyFileSync("node_modules/libavoid-js/LICENSE", "vendor/libavoid.LICENSE");
    fs.copyFileSync("node_modules/elkjs/LICENSE.md", "vendor/elkjs.LICENSE");
    fs.copyFileSync("node_modules/elkjs/lib/elk.bundled.js", "vendor/elk.bundled.js");
}

// 把界面和本地依赖合成普通脚本，让页面双击后也可以离线运行
async function buildApplication() {
    prepareRoutingRuntime();
    await esbuild.build(ROUTING_BUILD_OPTIONS);
    await esbuild.build(BUILD_OPTIONS);
    updatePageVersion();
    fs.mkdirSync(EXAMPLE_OUTPUT.directory, { recursive: true });
    fs.writeFileSync(EXAMPLE_OUTPUT.filename, JSON.stringify(complementPreset(), null, EXAMPLE_OUTPUT.indent));
    fs.writeFileSync(RAM_EXAMPLE_OUTPUT, JSON.stringify(ramPreset(), null, EXAMPLE_OUTPUT.indent));
    writeWiringGuide();
    writeRamGuide();
}

await buildApplication();
