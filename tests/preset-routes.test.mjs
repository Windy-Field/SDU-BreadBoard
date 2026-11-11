import test from "node:test";
import assert from "node:assert/strict";
import original from "./fixtures/complement-original.json" with { type: "json" };
import { complementPreset, restorePresetRoutes } from "../src/presets.mjs";
import { wirePoints } from "../src/geometry.mjs";
import { validateProject } from "../src/storage.mjs";
import { wiringMetrics } from "./wiring-metrics.mjs";
import { routeWires } from "../src/routing.mjs";
import { emptyProject, portHole, isPhysicalHole } from "../src/board.mjs";

// 和旧示例比较，板载端口改为对应真实孔，其他端点、芯片与线色保持不变
function testConnectionsUnchanged() {
    const project = validateProject(complementPreset());
    assert.deepEqual(project.chips, original.chips);
    assert.equal(project.wires.length, original.wires.length);
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const actual = project.wires[index];
        const expected = original.wires[index];
        assert.equal(actual.id, expected.id);
        let from = expected.from;
        let to = expected.to;
        if (!isPhysicalHole(from)) {
            from = portHole(from);
        }
        if (!isPhysicalHole(to)) {
            to = portHole(to);
        }
        assert.equal(actual.from, from);
        assert.equal(actual.to, to);
        assert.equal(isPhysicalHole(actual.from), true);
        assert.equal(isPhysicalHole(actual.to), true);
        assert.equal(actual.color, expected.color);
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

// 整理仅替换路径，失败不做部分修改，也不覆盖已编辑的颜色、备注或输入
function testRestoreRoutes() {
    const project = validateProject(original);
    project.notes = "我的实验备注";
    project.switches[0] = 1;
    project.wires[0].color = "#123456";
    project.wires[0].bends = [{ x: 20, y: 20 }];
    assert.equal(restorePresetRoutes(project), true);
    assert.equal(project.notes, "我的实验备注");
    assert.equal(project.switches[0], 1);
    assert.equal(project.wires[0].color, "#123456");
    assert.deepEqual(project.wires[0].bends, complementPreset().wires[0].bends);
    project.wires[0].from = "R:VCC:0";
    const before = structuredClone(project);
    assert.equal(restorePresetRoutes(project), false);
    assert.deepEqual(project, before);
    const moved = complementPreset();
    moved.chips[0].column = moved.chips[0].column + 1;
    const movedBefore = structuredClone(moved);
    assert.equal(restorePresetRoutes(moved), false);
    assert.deepEqual(moved, movedBefore);
}

test("示例61根线只使用真实插孔且保持信号与芯片位置", testConnectionsUnchanged);
test("固定路径减少覆盖并绕开芯片外框", testRoutingReadability);
test("整理示例路径保留其他编辑并拒绝不同结构", testRestoreRoutes);

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
