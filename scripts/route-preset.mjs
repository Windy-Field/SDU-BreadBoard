import fs from "node:fs";
import { complementPreset } from "../src/experiments/presets.mjs";
import { routeWires } from "../src/board/routing.mjs";
import { ramPreset } from "../src/experiments/ram-preset.mjs";
import { timingPreset } from "../src/experiments/timing-preset.mjs";

// 示例路径数据的输出位置与 JSON 缩进
const ROUTE_OUTPUT = { filename: "src/experiments/preset-routes.json", indent: 2 };
const RAM_ROUTE_OUTPUT = "src/experiments/ram-routes.json";
const TIMING_WIRE_OUTPUT = "src/experiments/timing-wires.json";
const PRESET_ANGLE = 45;

// 构建时使用与界面相同的整理算法，生成可离线加载的示例路径
async function main() {
    const useRamPreset = process.argv[2] === "ram";
    let project = complementPreset();
    let filename = ROUTE_OUTPUT.filename;
    if (useRamPreset) {
        project = ramPreset();
        filename = RAM_ROUTE_OUTPUT;
    } else if (process.argv[2] === "timing") {
        project = timingPreset();
        filename = TIMING_WIRE_OUTPUT;
    }
    const routes = await routeWires(project, PRESET_ANGLE);
    let output = routes;
    if (filename === TIMING_WIRE_OUTPUT) {
        for (const wire of project.wires) {
            wire.bends = routes[wire.id];
            wire.angle = PRESET_ANGLE;
        }
        output = project.wires;
    }
    const content = JSON.stringify(output, null, ROUTE_OUTPUT.indent);
    fs.writeFileSync(filename, content);
    console.log("已为 " + project.wires.length + " 根示例导线生成固定路径");
}

await main();
