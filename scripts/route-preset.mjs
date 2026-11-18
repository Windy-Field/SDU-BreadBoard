import fs from "node:fs";
import { complementPreset } from "../src/experiments/presets.mjs";
import { routeWires } from "../src/board/routing.mjs";
import { ramPreset } from "../src/experiments/ram-preset.mjs";
import { endpointPosition } from "../src/board/board.mjs";

// 示例路径数据的输出位置与 JSON 缩进
const ROUTE_OUTPUT = { filename: "src/experiments/preset-routes.json", indent: 2 };
const RAM_ROUTE_OUTPUT = "src/experiments/ram-routes.json";
// 横跨两片RAM的长线按上下分组，每组依次分配9像素间距
const RAM_UPPER_WIRES = ["W53", "W57", "W61", "W65", "W69", "W72", "W74"];
const RAM_LOWER_WIRES = ["W29", "W31", "W33", "W35", "W41", "W45", "W49"];
const RAM_LANE_SPACING = 9;

// 把跨芯片长线安排到板间空白通道，两端仍接原来的同列空孔
function spaceRamWires(project, routes, names, direction) {
    for (let index = 0; index < names.length; index = index + 1) {
        for (const wire of project.wires) {
            if (wire.id !== names[index]) {
                continue;
            }
            const first = endpointPosition(wire.from);
            const last = endpointPosition(wire.to);
            const distance = (index + 1) * RAM_LANE_SPACING;
            const lane = first.y + direction * distance;
            routes[wire.id] = [{ x: first.x, y: lane }, { x: last.x, y: lane }];
        }
    }
}

// 构建时使用与界面相同的整理算法，生成可离线加载的示例路径
async function main() {
    const useRamPreset = process.argv[2] === "ram";
    let project = complementPreset();
    let filename = ROUTE_OUTPUT.filename;
    if (useRamPreset) {
        project = ramPreset();
        filename = RAM_ROUTE_OUTPUT;
    }
    const routes = await routeWires(project);
    if (useRamPreset) {
        spaceRamWires(project, routes, RAM_UPPER_WIRES, -1);
        spaceRamWires(project, routes, RAM_LOWER_WIRES, 1);
    }
    const content = JSON.stringify(routes, null, ROUTE_OUTPUT.indent);
    fs.writeFileSync(filename, content);
    console.log("已为 " + project.wires.length + " 根示例导线生成固定路径");
}

await main();
