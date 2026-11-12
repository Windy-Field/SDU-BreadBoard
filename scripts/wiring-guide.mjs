import fs from "node:fs";
import { complementPreset, COMPLEMENT_NOTES } from "../src/presets.mjs";
import { baseNode, pinHole, portHole, IO_LIMIT } from "../src/board.mjs";
import { CHIP_MODELS } from "../src/chips.mjs";
import { wirePoints } from "../src/geometry.mjs";

// 接线文档的输出位置和颜色名称，只影响说明文本
const GUIDE_OUTPUT = "docs/complement-wiring.md";
const COLOR_NAMES = { "#dc3545": "红色", "#46515f": "深灰", "#16845b": "绿色", "#8b55c5": "紫色", "#1976d2": "蓝色", "#d68a0b": "黄色", "#0d939d": "青色", "#d44f93": "粉色", "#e26c2b": "橙色" };

// 将物理孔关联到同列芯片引脚，方便读者从端点表核对脚号
function pinDescription(project, endpoint) {
    const signals = ["GND", "VCC", "P+", "P-"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        signals.push("K" + bit, "L" + bit);
    }
    for (const signal of signals) {
        if (baseNode(portHole(signal)) === baseNode(endpoint)) {
            return signal + " 对应列";
        }
    }
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
    const lines = [COMPLEMENT_NOTES.trim(), "", "## 芯片位置", "", "示例中的芯片缺口均朝左，跨接在 E/F 沟槽两侧，板块序号从上到下为 1～4", "", "| 编号 | 型号 | 板块 | 起始列 |", "| --- | --- | --- | --- |"];
    for (const chip of project.chips) {
        lines.push("| " + chip.id + " | " + chip.model + " | " + (chip.section + 1) + " | " + chip.column + " |");
    }
    lines.push("", "## 逐线核对", "", "B1:G:24 表示第 2 块面包板 G 行第 24 列，同列 A～E 相通、F～J 相通。下表列出了每根导线的端点、对应引脚和颜色，你可以按编号逐项核对", "", "| 导线 | 起点 | 起点对应引脚 | 终点 | 终点对应引脚 | 颜色 |", "| --- | --- | --- | --- | --- | --- |");
    for (const wire of project.wires) {
        lines.push("| " + wire.id + " | " + wire.from + " | " + pinDescription(project, wire.from) + " | " + wire.to + " | " + pinDescription(project, wire.to) + " | " + COLOR_NAMES[wire.color] + " |");
    }
    lines.push("", "## 路径坐标", "", "坐标以画布逻辑像素为单位，左上角为原点。每行列出了起点、全部转折点和终点。电气连接取决于导线两端的插孔，途经其他插孔或交叉处时保持绝缘", "", "| 导线 | 折线路径（x, y） |", "| --- | --- |");
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        const positions = [];
        for (const point of wirePoints(wire, index)) {
            positions.push("(" + point.x + ", " + point.y + ")");
        }
        lines.push("| " + wire.id + " | " + positions.join(" → ") + " |");
    }
    lines.push("", "## 文件与验证", "", "标准示例文件为 [complement-adder.json](../examples/complement-adder.json)。当你确认左侧的“整理走线”操作后，程序会在保留起点和终点的前提下调整拐角、重叠和间距，整个操作支持撤销", "", "`npm run route:preset` 用于重新生成固定路径，`npm run build` 用于同步运行文件、JSON 和本文档。`npm test` 使用了优化前的独立端点记录作对照，并穷举 4096 种加减组合", "");
    fs.writeFileSync(GUIDE_OUTPUT, lines.join("\n"));
}
