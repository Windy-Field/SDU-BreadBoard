import fs from "node:fs";
import { complementPreset, COMPLEMENT_NOTES } from "../src/presets.mjs";
import { baseNode, pinHole } from "../src/board.mjs";
import { CHIP_MODELS } from "../src/chips.mjs";
import { wirePoints } from "../src/geometry.mjs";

const COLOR_NAMES = { "#dc3545": "红色", "#46515f": "深灰", "#16845b": "绿色", "#8b55c5": "紫色", "#1976d2": "蓝色", "#d68a0b": "黄色", "#0d939d": "青色", "#d44f93": "粉色" };

// 将物理孔关联到同列芯片引脚，方便读者从端点表核对脚号
function pinDescription(project, endpoint) {
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            if (baseNode(pinHole(chip, pin)) === baseNode(endpoint)) {
                return chip.id + "-" + pin + "（" + model.labels[pin] + "）";
            }
        }
    }
    return endpoint;
}

// 从运行时示例生成接线表和折线坐标，文档与 JSON 共用同一份端点和路径
export function writeWiringGuide() {
    const project = complementPreset();
    const lines = [COMPLEMENT_NOTES.trim(), "", "## 芯片位置", "", "芯片缺口均朝左，跨 E/F 沟槽，板块序号从上到下为 1～4", "", "| 编号 | 型号 | 板块 | 起始列 |", "| --- | --- | --- | --- |"];
    for (const chip of project.chips) {
        lines.push("| " + chip.id + " | " + chip.model + " | " + (chip.section + 1) + " | " + chip.column + " |");
    }
    lines.push("", "## 逐线核对", "", "B1:G:24 表示第 2 块面包板 G 行第 24 列，同列 A～E 相通、F～J 相通。你可以按导线编号核对端点，再查看同组引脚", "", "| 导线 | 起点 | 起点对应引脚 | 终点 | 终点对应引脚 | 颜色 |", "| --- | --- | --- | --- | --- | --- |");
    for (const wire of project.wires) {
        lines.push("| " + wire.id + " | " + wire.from + " | " + pinDescription(project, wire.from) + " | " + wire.to + " | " + pinDescription(project, wire.to) + " | " + COLOR_NAMES[wire.color] + " |");
    }
    lines.push("", "## 路径坐标", "", "坐标采用画布逻辑像素，左上角为原点。每行包含起点、全部转折点和终点，仅用于显示；导线经过某个孔或与另一根线交叉时，不会自动接通", "", "| 导线 | 折线路径（x, y） |", "| --- | --- |");
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        const positions = [];
        for (const point of wirePoints(wire, index)) {
            positions.push("(" + point.x + ", " + point.y + ")");
        }
        lines.push("| " + wire.id + " | " + positions.join(" → ") + " |");
    }
    lines.push("", "## 文件与验证", "", "你可以导入 [complement-adder.json](../examples/complement-adder.json) 使用标准示例，或通过左侧“整理走线”调整当前电路的路径，确认后生效并支持撤销", "", "开发时运行 `npm run route:preset` 重新生成固定路径，再运行 `npm run build` 同步运行文件、JSON 和本文档。`npm test` 对比优化前的独立端点记录，并穷举 4096 种加减组合", "");
    fs.writeFileSync("docs/complement-wiring.md", lines.join("\n"));
}
