import test from "node:test";
import assert from "node:assert/strict";
import original from "./fixtures/complement-original.json" with { type: "json" };
import { complementPreset } from "../src/presets.mjs";
import { wirePoints } from "../src/geometry.mjs";
import { validateProject } from "../src/storage.mjs";
import { wiringMetrics } from "./wiring-metrics.mjs";
import { routeWires } from "../src/routing.mjs";
import { emptyProject, portHole, isPhysicalHole } from "../src/board.mjs";

// 和旧示例比较，板载端口改为真实孔，芯片与端点不变，线色按用途整理
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

test("示例61根线只使用真实插孔且保持信号与芯片位置", testConnectionsUnchanged);
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
