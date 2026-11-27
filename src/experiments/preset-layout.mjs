import { CHIP_MODELS } from "../chips/chips.mjs";
import { baseNode, pinHole, copyProject } from "../board/board.mjs";
import { complementPreset } from "./presets.mjs";
import { ramPreset, RAM_OUTER_WIRES, RAM_NOTES, PREVIOUS_RAM_NOTES } from "./ram-preset.mjs";
import { validateProject } from "../storage/storage.mjs";
import { timingPreset } from "./timing-preset.mjs";
import releasedWires from "./released-wires.json" with { type: "json" };

// 只迁移此前发布的标准位置，用户自行移动或改接的实验保持原样
const PREVIOUS_LAYOUTS = [
    { create: complementPreset, columns: [24, 16, 39, 3, 44], ram: false },
    { create: ramPreset, columns: [8, 35, 35, 12], ram: true }
];
// 已发布的标准走线用于识别旧示例，用户自行调整过的路径保留在原实验中
const RELEASED_PRESETS = [
    { previous: releasedWires["complement-adder"], create: complementPreset },
    { previous: releasedWires["ram-expansion"], create: ramPreset },
    { previous: releasedWires["timing-system"], create: timingPreset }
];

// 以新版导线为底，保留用户自己选的线色
function updatedWire(wire, expected, defaultColor) {
    const updated = copyProject(expected);
    if (wire.color !== defaultColor) {
        updated.color = wire.color;
    }
    return updated;
}

// 逐根核对旧示例的孔位和转折点，匹配后返回新版导线与备注
export function updateReleasedPreset(project) {
    for (const item of RELEASED_PRESETS) {
        const previous = item.previous;
        if (project.wires.length !== previous.wires.length || project.pullUps.length !== 0) {
            continue;
        }
        const reference = item.create();
        if (JSON.stringify(project.chips) !== JSON.stringify(reference.chips)) {
            continue;
        }
        const wires = [];
        for (let index = 0; index < project.wires.length; index = index + 1) {
            const wire = project.wires[index];
            const oldWire = previous.wires[index];
            const description = [wire.id, wire.from, wire.to, wire.bends];
            if (wire.angle !== undefined || JSON.stringify(description) !== JSON.stringify(oldWire.slice(0, 4))) {
                break;
            }
            wires.push(updatedWire(wire, reference.wires[index], oldWire[4]));
        }
        if (wires.length === project.wires.length) {
            const updated = Object.assign({}, project);
            updated.wires = wires;
            if (project.notes === previous.notes) {
                updated.notes = reference.notes;
            }
            return updated;
        }
    }
    return project;
}

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
                updated.wires[index] = updatedWire(wire, expected, "");
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
        updated.wires[index] = updatedWire(wire, newWire, "");
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
