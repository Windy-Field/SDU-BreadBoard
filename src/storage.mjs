import { emptyProject, placementError, validEndpoint, pinHole, IO_LIMIT, NOTES_LIMIT } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";
import { COMPLEMENT_NOTES } from "./presets.mjs";

export const STORAGE_KEY = "breadboard-lab-v1";
export const LIMITS = { chips: 40, wires: 800, bends: 24, fileBytes: 2000000 };

// 校验并重建导入电路，只接受约定字段，避免把任意文件当成电路运行
export function validateProject(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.chips) || !Array.isArray(value.wires) || !Array.isArray(value.switches)) {
        throw new Error("文件不是受支持的电路格式");
    }
    if (value.chips.length > LIMITS.chips || value.wires.length > LIMITS.wires || value.switches.length !== 24) {
        throw new Error("电路规模超过限制，或按键数量不正确");
    }
    const project = emptyProject();
    // 旧文件的显示位数继续保留，补码示例的控制端和溢出端也一并显示
    if (value.inputCount !== undefined || value.outputCount !== undefined) {
        if (!Number.isInteger(value.inputCount) || !Number.isInteger(value.outputCount) || value.inputCount < 1 || value.inputCount > IO_LIMIT || value.outputCount < 1 || value.outputCount > IO_LIMIT) {
            throw new Error("输入和输出显示位数必须为 1～24");
        }
        project.inputCount = value.inputCount;
        project.outputCount = value.outputCount;
    }
    if (value.mode === "complement") {
        project.inputCount = Math.max(project.inputCount, 7);
        project.outputCount = Math.max(project.outputCount, 7);
    }
    if (value.notes === undefined && value.mode === "complement") {
        project.notes = COMPLEMENT_NOTES;
    } else if (value.notes !== undefined) {
        if (typeof value.notes !== "string" || value.notes.length > NOTES_LIMIT) {
            throw new Error("备注必须是文字，且不能超过 50000 个字符");
        }
        project.notes = value.notes;
    }
    if (value.pullUps !== undefined) {
        if (!Array.isArray(value.pullUps) || value.pullUps.length > LIMITS.wires) {
            throw new Error("上拉节点列表格式不正确");
        }
        const seen = new Set();
        for (const endpoint of value.pullUps) {
            if (!validEndpoint(endpoint) || seen.has(endpoint)) {
                throw new Error("上拉节点不合法或重复");
            }
            project.pullUps.push(endpoint);
            seen.add(endpoint);
        }
    }
    if (typeof value.name === "string") {
        project.name = value.name.slice(0, 80);
    }
    project.power = value.power === true;
    const identifiers = new Set();
    const occupied = new Set();
    for (const entry of value.chips) {
        if (!entry || typeof entry.id !== "string" || !/^U[1-9][0-9]*$/.test(entry.id) || identifiers.has(entry.id)) {
            throw new Error("芯片编号不合法或重复");
        }
        const chip = { id: entry.id, model: entry.model, section: entry.section, column: entry.column };
        const error = placementError(project.chips, chip, "");
        if (error !== "") {
            throw new Error(error);
        }
        identifiers.add(chip.id);
        project.chips.push(chip);
        for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
            occupied.add(pinHole(chip, pin));
        }
    }
    identifiers.clear();
    for (const entry of value.wires) {
        if (!entry || typeof entry.id !== "string" || !/^W[1-9][0-9]*$/.test(entry.id) || identifiers.has(entry.id)) {
            throw new Error("导线编号不合法或重复");
        }
        if (!validEndpoint(entry.from) || !validEndpoint(entry.to) || entry.from === entry.to || occupied.has(entry.from) || occupied.has(entry.to)) {
            throw new Error("导线端点不合法，或同一个孔被重复占用");
        }
        if (typeof entry.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(entry.color) || !Array.isArray(entry.bends) || entry.bends.length > LIMITS.bends) {
            throw new Error("导线颜色或转折点不合法");
        }
        const bends = [];
        for (const bend of entry.bends) {
            if (!bend || !Number.isFinite(bend.x) || !Number.isFinite(bend.y) || bend.x < 0 || bend.x > 1300 || bend.y < 0 || bend.y > 1280) {
                throw new Error("导线转折点超出面包板范围");
            }
            bends.push({ x: bend.x, y: bend.y });
        }
        project.wires.push({ id: entry.id, from: entry.from, to: entry.to, color: entry.color, bends: bends });
        occupied.add(entry.from);
        occupied.add(entry.to);
        identifiers.add(entry.id);
    }
    for (let index = 0; index < 24; index = index + 1) {
        if (value.switches[index] !== 0 && value.switches[index] !== 1) {
            throw new Error("按键状态必须是 0 或 1");
        }
        project.switches[index] = value.switches[index];
    }
    return project;
}
