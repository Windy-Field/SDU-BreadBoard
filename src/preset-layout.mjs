import { CHIP_MODELS } from "./chips.mjs";
import { baseNode, pinHole, copyProject } from "./board.mjs";
import { complementPreset } from "./presets.mjs";
import { ramPreset, RAM_OUTER_WIRES, RAM_NOTES, PREVIOUS_RAM_NOTES } from "./ram-preset.mjs";
import { validateProject } from "./storage.mjs";

// 只迁移此前发布的标准位置，用户自行移动或改接的实验保持原样
const PREVIOUS_LAYOUTS = [
    { create: complementPreset, columns: [24, 16, 39, 3, 44], ram: false },
    { create: ramPreset, columns: [8, 35, 35, 12], ram: true }
];

// 将标准导线端点映射到旧芯片位置，非芯片端点仍使用原孔位
function previousEndpoint(endpoint, reference, columns) {
    for (let index = 0; index < reference.chips.length; index = index + 1) {
        const chip = reference.chips[index];
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            if (baseNode(endpoint) === baseNode(pinHole(chip, pin))) {
                const parts = endpoint.split(":");
                const column = Number(parts[2]) + columns[index] - chip.column;
                return parts[0] + ":" + parts[1] + ":" + column;
            }
        }
    }
    return endpoint;
}

// 核对旧标准布局的芯片、导线和孔位，任一实际接线变更都不自动迁移
function matchesPreviousLayout(project, reference, columns) {
    if (project.chips.length !== reference.chips.length || project.wires.length !== reference.wires.length || project.pullUps.length !== 0) {
        return false;
    }
    for (let index = 0; index < reference.chips.length; index = index + 1) {
        const expected = reference.chips[index];
        const actual = project.chips[index];
        if (actual.id !== expected.id || actual.model !== expected.model || actual.section !== expected.section || actual.column !== columns[index]) {
            return false;
        }
    }
    for (let index = 0; index < reference.wires.length; index = index + 1) {
        const expected = reference.wires[index];
        const actual = project.wires[index];
        const from = previousEndpoint(expected.from, reference, columns);
        const to = previousEndpoint(expected.to, reference, columns);
        if (actual.id !== expected.id || actual.from !== from || actual.to !== to) {
            return false;
        }
    }
    return true;
}

// 迁移未改接的旧示例，保留名称、备注、输入和线色，只更新位置与路径
export function centerSavedPresets(workspace) {
    let changed = false;
    for (const id of Object.keys(workspace.projects)) {
        const project = workspace.projects[id];
        if (project.notes === PREVIOUS_RAM_NOTES) {
            project.notes = RAM_NOTES;
            changed = true;
        }
        for (const layout of PREVIOUS_LAYOUTS) {
            const reference = layout.create();
            let previous = reference;
            if (layout.ram) {
                previous = ramPreset(false);
            }
            if (!matchesPreviousLayout(project, previous, layout.columns)) {
                continue;
            }
            const updated = copyProject(project);
            updated.chips = copyProject(reference.chips);
            for (let index = 0; index < updated.wires.length; index = index + 1) {
                const wire = updated.wires[index];
                const expected = reference.wires[index];
                wire.from = expected.from;
                wire.to = expected.to;
                wire.bends = copyProject(expected.bends);
                delete wire.angle;
            }
            workspace.projects[id] = updated;
            changed = true;
        }
        const rerouted = separateSavedRamWires(workspace.projects[id]);
        if (rerouted) {
            workspace.projects[id] = rerouted;
            changed = true;
        }
    }
    return changed;
}

// 仅调整仍使用旧版RAM端点的长线，保留其他导线与用户设置
function separateSavedRamWires(project) {
    const previous = ramPreset(false);
    const current = ramPreset();
    if (project.chips.length !== current.chips.length || project.wires.length !== current.wires.length) {
        return null;
    }
    for (let index = 0; index < current.chips.length; index = index + 1) {
        const expected = current.chips[index];
        const actual = project.chips[index];
        if (actual.id !== expected.id || actual.model !== expected.model || actual.section !== expected.section || actual.column !== expected.column) {
            return null;
        }
    }
    const updated = copyProject(project);
    let changed = false;
    for (let index = 0; index < current.wires.length; index = index + 1) {
        const wire = updated.wires[index];
        const oldWire = previous.wires[index];
        const newWire = current.wires[index];
        if (wire.id !== oldWire.id) {
            return null;
        }
        if (baseNode(wire.from) !== baseNode(oldWire.from) || baseNode(wire.to) !== baseNode(oldWire.to)) {
            return null;
        }
        if (!RAM_OUTER_WIRES.includes(wire.id)) {
            continue;
        }
        if (wire.from === newWire.from && wire.to === newWire.to) {
            continue;
        }
        if (wire.from !== oldWire.from || wire.to !== oldWire.to) {
            return null;
        }
        wire.from = newWire.from;
        wire.to = newWire.to;
        wire.bends = copyProject(newWire.bends);
        delete wire.angle;
        changed = true;
    }
    if (!changed) {
        return null;
    }
    // 用户可能已经占用了目标空孔，校验失败时保留整个原存档
    try {
        validateProject(updated);
    } catch (error) {
        return null;
    }
    return updated;
}
