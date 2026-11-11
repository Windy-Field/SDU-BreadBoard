import fs from "node:fs";
import { complementPreset } from "../src/presets.mjs";
import { routeWires } from "../src/routing.mjs";

// 示例路径数据的输出位置与 JSON 缩进
const ROUTE_OUTPUT = { filename: "src/preset-routes.json", indent: 2 };

// 构建时使用与界面相同的整理算法，生成可离线加载的示例路径
async function main() {
    const project = complementPreset();
    const routes = await routeWires(project);
    fs.writeFileSync(ROUTE_OUTPUT.filename, JSON.stringify(routes, null, ROUTE_OUTPUT.indent));
    console.log("已为 " + project.wires.length + " 根示例导线生成固定路径");
}

await main();
