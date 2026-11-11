import fs from "node:fs";
import { complementPreset } from "../src/presets.mjs";
import { routeWires } from "../src/routing.mjs";

// 构建时使用与界面相同的整理算法，生成可离线加载的示例路径
async function main() {
    const project = complementPreset();
    const routes = await routeWires(project);
    fs.writeFileSync("src/preset-routes.json", JSON.stringify(routes, null, 2));
    console.log("已为 " + project.wires.length + " 根示例导线生成固定路径");
}

await main();
