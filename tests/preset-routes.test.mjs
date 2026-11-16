import test from "node:test";
import assert from "node:assert/strict";
import original from "./fixtures/complement-original.json" with { type: "json" };
import { complementPreset, isComplementPreset } from "../src/presets.mjs";
import { wirePoints } from "../src/geometry.mjs";
import { validateProject } from "../src/storage.mjs";
import { wiringMetrics } from "./wiring-metrics.mjs";
import { routeWires } from "../src/routing.mjs";
import { emptyProject, portHole, isPhysicalHole, baseNode, pinHole, BOARD } from "../src/board.mjs";
import { CHIP_MODELS } from "../src/chips.mjs";
import { ramPreset, RAM_OUTER_WIRES, RAM_NOTES, PREVIOUS_RAM_NOTES } from "../src/ram-preset.mjs";
import { centerSavedPresets } from "../src/preset-layout.mjs";

// 将旧版孔位对应到同一芯片的新位置，保持行号和该脚所在铜排不变
function movedEndpoint(endpoint, chips) {
    if (!isPhysicalHole(endpoint)) {
        return portHole(endpoint);
    }
    for (const oldChip of original.chips) {
        for (let pin = 1; pin <= CHIP_MODELS[oldChip.model].count; pin = pin + 1) {
            if (baseNode(endpoint) !== baseNode(pinHole(oldChip, pin))) {
                continue;
            }
            for (const chip of chips) {
                if (chip.id === oldChip.id) {
                    const parts = endpoint.split(":");
                    const column = Number(parts[2]) + chip.column - oldChip.column;
                    return "B" + chip.section + ":" + parts[1] + ":" + column;
                }
            }
        }
    }
    return endpoint;
}

// 和旧示例比较，芯片移动后每根线仍接原来的引脚，线色按用途整理
function testConnectionsUnchanged() {
    const project = validateProject(complementPreset());
    assert.equal(project.chips.length, original.chips.length);
    assert.equal(project.wires.length, original.wires.length);
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const actual = project.wires[index];
        const expected = original.wires[index];
        assert.equal(actual.id, expected.id);
        const from = movedEndpoint(expected.from, project.chips);
        const to = movedEndpoint(expected.to, project.chips);
        assert.equal(actual.from, from);
        assert.equal(actual.to, to);
        assert.equal(isPhysicalHole(actual.from), true);
        assert.equal(isPhysicalHole(actual.to), true);
        let expectedColor = expected.color;
        if (actual.id === "W36" || actual.id === "W37") {
            expectedColor = "#16845b";
        }
        if (actual.id === "W57" || actual.id === "W58" || actual.id === "W59") {
            expectedColor = "#e26c2b";
        }
        assert.equal(actual.color, expectedColor);
        assert.ok(actual.bends.length > 0);
        const points = wirePoints(actual, index);
        for (let position = 1; position < points.length; position = position + 1) {
            const first = points[position - 1];
            const last = points[position];
            assert.ok(first.x === last.x || first.y === last.y, actual.id + " 存在斜线");
        }
    }
}

// 比较两版路径，限制共线覆盖并禁止导线穿过芯片外框
function testRoutingReadability() {
    const before = wiringMetrics(original);
    const after = wiringMetrics(complementPreset());
    console.log("走线比较：共线重叠 " + before.overlap + " → " + after.overlap + "，穿过芯片 " + before.chipCrossings + " → " + after.chipCrossings);
    assert.ok(after.overlap < before.overlap / 4);
    assert.equal(after.chipCrossings, 0);
}

test("示例61根线移动后保持原引脚连接且只使用真实插孔", testConnectionsUnchanged);
test("固定路径减少覆盖并绕开芯片外框", testRoutingReadability);

// 普通实验也能整理走线，寻路结果不会改动原电路，重复执行结果一致
async function testGeneralRouting() {
    const project = emptyProject();
    project.chips.push({ id: "U1", model: "74LS00", section: 0, column: 20 });
    project.wires = [
        { id: "W1", from: "B0:A:2", to: "B0:J:40", color: "#123456", bends: [] },
        { id: "W2", from: "B3:J:49", to: "B0:D:20", color: "#654321", bends: [] },
        { id: "W3", from: "B0:E:1", to: "B0:F:1", color: "#1976d2", bends: [] }
    ];
    const before = structuredClone(project);
    const routes = await routeWires(project);
    assert.deepEqual(project, before);
    assert.deepEqual(await routeWires(project), routes);
    for (const wire of project.wires) {
        wire.bends = routes[wire.id];
        assert.ok(wire.bends.length > 0);
    }
    validateProject(project);
    assert.equal(wiringMetrics(project).chipCrossings, 0);
}

test("普通实验整理路径保持端点且绕开芯片", testGeneralRouting);

// 示例识别只看芯片和实际接线，显示调整、输入值及导线排列不影响启动清零
function testPresetRecognition() {
    const project = complementPreset();
    project.name = "我的加法实验";
    project.notes = "自定义备注";
    project.switches[0] = 1;
    project.switches[6] = 0;
    project.chips.reverse();
    project.wires.reverse();
    for (const wire of project.wires) {
        const previousFrom = wire.from;
        wire.from = wire.to;
        wire.to = previousFrom;
        wire.color = "#123abc";
        wire.bends = [];
    }
    const before = structuredClone(project);
    assert.equal(isComplementPreset(project), true);
    assert.deepEqual(project, before);
    assert.equal(isComplementPreset(emptyProject()), false);
}

// 名称相同但接线、型号、位置或上拉发生变化时，不允许自动清零用户电路
function testModifiedPresetRecognition() {
    let project = complementPreset();
    project.wires.pop();
    assert.equal(isComplementPreset(project), false);
    project = complementPreset();
    project.wires[0].to = "B0:A:1";
    assert.equal(isComplementPreset(project), false);
    project = complementPreset();
    project.wires[0] = structuredClone(project.wires[1]);
    assert.equal(isComplementPreset(project), false);
    project = complementPreset();
    project.chips[0].model = "74LS283";
    assert.equal(isComplementPreset(project), false);
    project = complementPreset();
    project.chips[0].column = project.chips[0].column + 1;
    assert.equal(isComplementPreset(project), false);
    project = complementPreset();
    project.pullUps.push("B0:A:1");
    assert.equal(isComplementPreset(project), false);
}

test("启动示例识别忽略显示与输入并保持工程不变", testPresetRecognition);
test("改接或自定义电路不会误判为标准启动示例", testModifiedPresetRecognition);

// 检查每一排左右外缘到中线距离相同，两侧芯片中心互为镜像
function testCenteredPresets() {
    const center = (BOARD.columns + 1) / 2;
    for (const project of [complementPreset(), ramPreset()]) {
        for (const section of [1, 2]) {
            let left = BOARD.columns;
            let right = 0;
            const centers = [];
            for (const chip of project.chips) {
                if (chip.section !== section) {
                    continue;
                }
                const half = CHIP_MODELS[chip.model].count / 2;
                const lastColumn = chip.column + half - 1;
                left = Math.min(left, chip.column);
                right = Math.max(right, lastColumn);
                centers.push((chip.column + lastColumn) / 2);
            }
            assert.ok(Math.abs((left + right) / 2 - center) <= 0.5, project.name + " 第" + (section + 1) + "块未居中");
            for (const chipCenter of centers) {
                let mirrored = false;
                for (const otherCenter of centers) {
                    if (Math.abs(chipCenter + otherCenter - center * 2) <= 1) {
                        mirrored = true;
                    }
                }
                assert.equal(mirrored, true, project.name + " 芯片缺少对称位置");
            }
        }
    }
}

test("两份存档各排芯片围绕板面中线对称居中", testCenteredPresets);

// 旧版标准加法器调整后保持用户输入和备注，已改接的副本不自动迁移
function testSavedLayoutMigration() {
    const previous = validateProject(structuredClone(original));
    previous.notes = "保留用户备注";
    previous.switches[0] = 1;
    previous.wires[0].color = "#123abc";
    const modified = structuredClone(previous);
    modified.wires.pop();
    const workspace = { version: 1, activeId: "first", projects: { first: previous, custom: modified } };
    const customBefore = JSON.stringify(modified);
    assert.equal(centerSavedPresets(workspace), true);
    const centered = workspace.projects.first;
    assert.deepEqual(centered.chips, complementPreset().chips);
    assert.equal(centered.notes, "保留用户备注");
    assert.equal(centered.switches[0], 1);
    assert.equal(centered.wires[0].color, "#123abc");
    assert.deepEqual(validateProject(centered), centered);
    assert.equal(JSON.stringify(workspace.projects.custom), customBefore);
    assert.equal(centerSavedPresets(workspace), false);
}

test("旧标准存档居中迁移保留用户内容并跳过改接副本", testSavedLayoutMigration);

// 独立构造旧RAM位置及同脚接线，验证两份示例都能迁移而不是只处理加法器
function testSavedRamLayoutMigration() {
    const current = ramPreset();
    const previous = ramPreset(false);
    const columns = [8, 35, 35, 12];
    for (let index = 0; index < previous.chips.length; index = index + 1) {
        previous.chips[index].column = columns[index];
    }
    for (const wire of previous.wires) {
        for (const field of ["from", "to"]) {
            const endpoint = wire[field];
            for (let index = 0; index < current.chips.length; index = index + 1) {
                const chip = current.chips[index];
                for (let pin = 1; pin <= CHIP_MODELS[chip.model].count; pin = pin + 1) {
                    if (baseNode(endpoint) === baseNode(pinHole(chip, pin))) {
                        const parts = endpoint.split(":");
                        const column = Number(parts[2]) + columns[index] - chip.column;
                        wire[field] = parts[0] + ":" + parts[1] + ":" + column;
                    }
                }
            }
        }
    }
    const workspace = { version: 1, activeId: "ram", projects: { ram: previous } };
    assert.equal(centerSavedPresets(workspace), true);
    assert.deepEqual(workspace.projects.ram, current);
    assert.equal(centerSavedPresets(workspace), false);
}

test("旧RAM存档同步移动芯片与同列导线后保持标准接线", testSavedRamLayoutMigration);

// 换孔只能改变同列行号，跨片长线的横向通道至少相隔9像素
function testRamOuterHoles() {
    const previous = ramPreset(false);
    const current = validateProject(ramPreset());
    const upperLanes = [];
    const lowerLanes = [];
    for (let index = 0; index < current.wires.length; index = index + 1) {
        const oldWire = previous.wires[index];
        const wire = current.wires[index];
        assert.equal(baseNode(wire.from), baseNode(oldWire.from), wire.id + " 起点网络变化");
        assert.equal(baseNode(wire.to), baseNode(oldWire.to), wire.id + " 终点网络变化");
        if (!RAM_OUTER_WIRES.includes(wire.id)) {
            assert.equal(wire.from, oldWire.from);
            assert.equal(wire.to, oldWire.to);
            continue;
        }
        const first = wire.from.split(":");
        const last = wire.to.split(":");
        assert.equal(first[1], last[1]);
        assert.ok(first[1] === "A" || first[1] === "J");
        const lane = wire.bends[0].y;
        assert.equal(lane, wire.bends[1].y);
        let lanes = lowerLanes;
        if (first[1] === "A") {
            lanes = upperLanes;
        }
        for (const other of lanes) {
            assert.ok(Math.abs(lane - other) >= 9, wire.id + " 横线间距不足");
        }
        lanes.push(lane);
    }
    assert.equal(upperLanes.length, 7);
    assert.equal(lowerLanes.length, 7);
    assert.equal(wiringMetrics(current).chipCrossings, 0);
}

// 已居中的旧RAM换孔时保留标题、输入、线色和其他自定义路径
function testSavedRamOuterHoles() {
    const previous = ramPreset(false);
    previous.name = "RAM 字扩展";
    previous.switches[0] = 1;
    previous.wires[0].color = "#123abc";
    previous.wires[0].bends = [{ x: 1100, y: 350 }];
    const untouched = structuredClone(previous.wires[0]);
    const workspace = { version: 1, activeId: "ram", projects: { ram: previous } };
    assert.equal(centerSavedPresets(workspace), true);
    const updated = workspace.projects.ram;
    assert.equal(updated.name, "RAM 字扩展");
    assert.equal(updated.switches[0], 1);
    assert.deepEqual(updated.wires[0], untouched);
    assert.deepEqual(validateProject(updated), updated);
    assert.equal(centerSavedPresets(workspace), false);
    const changed = ramPreset(false);
    changed.wires[28].to = "B1:J:55";
    const custom = { projects: { ram: changed } };
    assert.equal(centerSavedPresets(custom), false);
}

test("RAM跨片长线换到同列外侧孔且通道分开", testRamOuterHoles);
test("已居中RAM旧存档换孔保留用户设置与其他路径", testSavedRamOuterHoles);

// 默认长说明更新为简版，自定义备注及其余实验数据保持原样
function testRamNotesUpdate() {
    const previous = ramPreset();
    previous.notes = PREVIOUS_RAM_NOTES;
    const expected = structuredClone(previous);
    expected.notes = RAM_NOTES;
    const custom = ramPreset();
    custom.notes = PREVIOUS_RAM_NOTES + "\n我的实验记录";
    const customBefore = structuredClone(custom);
    const workspace = { projects: { previous: previous, custom: custom } };
    assert.equal(centerSavedPresets(workspace), true);
    assert.deepEqual(workspace.projects.previous, expected);
    assert.deepEqual(workspace.projects.custom, customBefore);
    assert.equal(centerSavedPresets(workspace), false);
}

test("RAM默认说明精简后保留自定义备注和完整接线", testRamNotesUpdate);
