import { emptyProject, placementError, validEndpoint, isPhysicalHole, portHole, baseNode, pinHole, IO_LIMIT, NOTES_LIMIT, WIRING_VERSION } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";
import { COMPLEMENT_NOTES } from "./presets.mjs";

// 单实验存储键，修改会影响旧数据恢复
export const STORAGE_KEY = "breadboard-lab-v1";
// 导入与编辑共同使用的规模限制
export const LIMITS = {
    chips: 40, // 单个实验的芯片数量上限
    wires: 800, // 单个实验的导线及上拉节点数量上限
    bends: 24, // 每根导线的转折点数量上限
    fileBytes: 2000000, // 导入文件字节数上限
    nameLength: 80 // 实验名称字符数上限
};
// 兼容旧文件的坐标范围，不随可见画布高度变化
const FILE_BOUNDS = { width: 1300, height: 1280 };

// 无版本旧文件的板载端口独立，版本 2 的第四块上下五孔也尚未桥接
function legacyNode(name, wiringVersion) {
    if (wiringVersion === undefined && (/^[KL]\d+$/.test(name) || name === "P+" || name === "P-")) {
        return name;
    }
    return baseNode(name, 2);
}

// 在迁移核对中查找连通组，不修改原文件
function connectionRoot(parents, name) {
    if (!parents.has(name)) {
        parents.set(name, name);
    }
    let root = name;
    while (parents.get(root) !== root) {
        root = parents.get(root);
    }
    return root;
}

// 分别建立新旧连接组，用信号端口与芯片引脚检查是否出现额外短接
function verifyPortMigration(original, migrated) {
    const before = new Map();
    const after = new Map();
    for (const wire of original.wires) {
        const first = connectionRoot(before, legacyNode(wire.from, original.wiringVersion));
        const last = connectionRoot(before, legacyNode(wire.to, original.wiringVersion));
        before.set(last, first);
    }
    for (const wire of migrated.wires) {
        const first = connectionRoot(after, baseNode(wire.from));
        const last = connectionRoot(after, baseNode(wire.to));
        after.set(last, first);
    }
    const terminals = ["P+", "P-", "VCC", "GND"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        terminals.push("K" + bit, "L" + bit);
    }
    for (const chip of migrated.chips) {
        for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
            terminals.push(pinHole(chip, pin));
        }
    }
    const forward = new Map();
    const reverse = new Map();
    for (const name of terminals) {
        const oldGroup = connectionRoot(before, legacyNode(name, original.wiringVersion));
        const newGroup = connectionRoot(after, baseNode(name));
        if ((forward.has(oldGroup) && forward.get(oldGroup) !== newGroup) || (reverse.has(newGroup) && reverse.get(newGroup) !== oldGroup)) {
            throw new Error("旧实验在 " + name + " 对应列已有其他信号，迁移会改变连接，请先备份并调整该列接线");
        }
        forward.set(oldGroup, newGroup);
        reverse.set(newGroup, oldGroup);
    }
}

// 旧文件中的板载端点改接同列空孔，已占用的真实孔优先保留
function migrateEndpoint(name, occupied) {
    if (isPhysicalHole(name)) {
        return name;
    }
    const preferred = portHole(name);
    if (preferred === "") {
        throw new Error("无法找到端口对应的面包板孔：" + name);
    }
    const parts = preferred.split(":");
    if (preferred.startsWith("R:")) {
        for (let index = Number(parts[2]); index >= 0; index = index - 1) {
            const hole = parts[0] + ":" + parts[1] + ":" + index;
            if (!occupied.has(hole)) {
                occupied.add(hole);
                return hole;
            }
        }
    } else {
        let rows = "JIHGF";
        if (parts[1] === "A") {
            rows = "ABCDE";
        }
        for (const row of rows) {
            const hole = parts[0] + ":" + row + ":" + parts[2];
            if (!occupied.has(hole)) {
                occupied.add(hole);
                return hole;
            }
        }
    }
    throw new Error(name + " 对应列已无空孔，原文件未修改，请先腾出一个插孔");
}

// 校验并重建导入电路，只接受约定字段，避免把任意文件当成电路运行
export function validateProject(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.chips) || !Array.isArray(value.wires) || !Array.isArray(value.switches)) {
        throw new Error("文件不是受支持的电路格式");
    }
    if (value.wiringVersion !== undefined && value.wiringVersion !== 2 && value.wiringVersion !== WIRING_VERSION) {
        throw new Error("不支持这份文件的接线布局版本");
    }
    if (value.chips.length > LIMITS.chips || value.wires.length > LIMITS.wires || value.switches.length !== IO_LIMIT) {
        throw new Error("电路规模超过限制，或按键数量不正确");
    }
    const project = emptyProject();
    // 旧文件的显示位数继续保留，补码示例的控制端和溢出端也一并显示
    if (value.inputCount !== undefined || value.outputCount !== undefined) {
        if (!Number.isInteger(value.inputCount) || !Number.isInteger(value.outputCount) || value.inputCount < 1 || value.inputCount > IO_LIMIT || value.outputCount < 1 || value.outputCount > IO_LIMIT) {
            throw new Error("输入和输出显示位数必须为 1～" + IO_LIMIT);
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
            throw new Error("备注必须是文字，且不能超过 " + NOTES_LIMIT + " 个字符");
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
        project.name = value.name.slice(0, LIMITS.nameLength);
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
    // 迁移时不能抢占文件中已有的物理端点
    const reserved = new Set(occupied);
    for (const entry of value.wires) {
        if (entry && isPhysicalHole(entry.from)) {
            reserved.add(entry.from);
        }
        if (entry && isPhysicalHole(entry.to)) {
            reserved.add(entry.to);
        }
    }
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
            if (!bend || !Number.isFinite(bend.x) || !Number.isFinite(bend.y) || bend.x < 0 || bend.x > FILE_BOUNDS.width || bend.y < 0 || bend.y > FILE_BOUNDS.height) {
                throw new Error("导线转折点超出面包板范围");
            }
            bends.push({ x: bend.x, y: bend.y });
        }
        const from = migrateEndpoint(entry.from, reserved);
        const to = migrateEndpoint(entry.to, reserved);
        if (from !== entry.from || to !== entry.to) {
            bends.length = 0;
        }
        const wire = { id: entry.id, from: from, to: to, color: entry.color, bends: bends };
        if (entry.angle !== undefined && entry.angle !== 45) {
            throw new Error("导线角度设置不正确");
        }
        if (entry.angle === 45) {
            wire.angle = 45;
        }
        project.wires.push(wire);
        occupied.add(entry.from);
        occupied.add(entry.to);
        identifiers.add(entry.id);
    }
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        if (value.switches[index] !== 0 && value.switches[index] !== 1) {
            throw new Error("按键状态必须是 0 或 1");
        }
        project.switches[index] = value.switches[index];
    }
    if (value.wiringVersion !== WIRING_VERSION) {
        verifyPortMigration(value, project);
    }
    return project;
}
