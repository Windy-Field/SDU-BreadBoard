import test from "node:test";
import assert from "node:assert/strict";
import { angleWirePath, simplifyWirePath, segmentCrossesBounds } from "../src/wire-path.mjs";
import { findRoute } from "../src/routing-graph.mjs";
import { wirePoints, hitTest, wireHandleAt } from "../src/geometry.mjs";
import { emptyProject, endpointPosition } from "../src/board.mjs";
import { validateProject, LIMITS } from "../src/storage.mjs";
import { routeWires } from "../src/routing.mjs";
import { createRuntime, simulate, readEndpoint } from "../src/engine.mjs";
import { wiringMetrics } from "./wiring-metrics.mjs";
import { complementPreset } from "../src/presets.mjs";

// 寻路测试使用的画布范围，不依赖页面缩放或鼠标位置
const ROUTE_BOUNDARY = { x: 0, y: 0, right: 300, bottom: 300 };

// 检查路径只包含横、竖和 45° 方向，返回斜线段数量
function assertAngles(points) {
    let diagonal = 0;
    for (let index = 1; index < points.length; index = index + 1) {
        const horizontal = Math.abs(points[index].x - points[index - 1].x);
        const vertical = Math.abs(points[index].y - points[index - 1].y);
        assert.ok(horizontal === 0 || vertical === 0 || Math.abs(horizontal - vertical) < 0.000001);
        if (horizontal > 0 && vertical > 0) {
            diagonal = diagonal + 1;
        }
    }
    return diagonal;
}

// 四个方向、长宽不等和折返路径都保持端点、指定转折位置及准确角度
function testAngleGeometry() {
    for (const horizontal of [-80, -30, 0, 30, 80]) {
        for (const vertical of [-80, -30, 0, 30, 80]) {
            const points = [{ x: 100, y: 100 }, { x: 100 + horizontal, y: 100 + vertical }];
            const angled = angleWirePath(points);
            assert.deepEqual(angled[0], points[0]);
            assert.deepEqual(angled[angled.length - 1], points[1]);
            assertAngles(angled);
            assert.deepEqual(angleWirePath(angled), angled);
        }
    }
    const returning = [{ x: 10, y: 10 }, { x: 30, y: 30 }, { x: 10, y: 10 }];
    assert.deepEqual(simplifyWirePath(returning), returning);
    assert.deepEqual(angleWirePath([]), []);
}

// 任意方向的线段都正确区分穿过芯片和只接触边界
function testCornerProtection() {
    const obstacle = { x: 12, y: 12, width: 4, height: 4 };
    assert.equal(segmentCrossesBounds({ x: 0, y: 0 }, { x: 30, y: 30 }, obstacle), true);
    assert.equal(segmentCrossesBounds({ x: 0, y: 12 }, { x: 30, y: 12 }, obstacle), false);
}

// 直线即使重叠也保持零拐角，不能为避让导线绕出额外转弯
function testCornerPriority() {
    const first = { x: 20, y: 50 };
    const last = { x: 180, y: 50 };
    const occupied = [{ first: first, last: last }];
    assert.deepEqual(findRoute(first, last, [], occupied, ROUTE_BOUNDARY, 45), [first, last]);
    const diagonal = findRoute({ x: 20, y: 20 }, { x: 180, y: 120 }, [], [], ROUTE_BOUNDARY, 45);
    assert.equal(diagonal.length, 3);
    assert.equal(assertAngles(diagonal), 1);
}

// 绕障碍需要两个拐角时，优先选重叠少的一侧，并检查小数端点精确保留
function testOverlapPriority() {
    const first = { x: 20, y: 50.25 };
    const last = { x: 180, y: 50.25 };
    const obstacle = { x: 80, y: 30, width: 40, height: 40 };
    const occupied = [{ first: { x: 0, y: 30 }, last: { x: 300, y: 30 } }];
    const path = findRoute(first, last, [obstacle], occupied, ROUTE_BOUNDARY, 0);
    assert.equal(path.length, 4);
    assert.deepEqual(path[0], first);
    assert.deepEqual(path[path.length - 1], last);
    assert.ok(path[1].y >= 70);
    assert.ok(path[2].y >= 70);
    assertAngles(path);
    assert.deepEqual(findRoute(first, last, [obstacle], occupied, ROUTE_BOUNDARY, 0), path);
    const blocked = { x: 0, y: 0, width: 300, height: 300 };
    assert.deepEqual(findRoute(first, last, [blocked], [], ROUTE_BOUNDARY, 45), []);
}

// 保存与导入保留角度，斜线中段可选中，自动补出的转折点也能用于拖动
function testAngleStorageAndPicking() {
    const project = emptyProject();
    project.wires.push({ id: "W1", from: "B0:A:1", to: "B0:J:15", color: "#1976d2", bends: [], angle: 45 });
    const restored = validateProject(project);
    assert.equal(restored.wires[0].angle, 45);
    const points = wirePoints(restored.wires[0], 0);
    assert.ok(assertAngles(points) > 0);
    assert.deepEqual(points[0], endpointPosition(project.wires[0].from));
    assert.deepEqual(points[points.length - 1], endpointPosition(project.wires[0].to));
    const middle = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    const state = { project: restored };
    assert.deepEqual(hitTest(middle, state, []), { kind: "wire", id: "W1" });
    const handle = wireHandleAt(points[1], restored, { kind: "wire", id: "W1" });
    assert.equal(handle.handle, 1);
    project.wires[0].angle = 30;
    assert.throws(validateProject.bind(null, project), /角度/);
}

// 45° 整理保持端点和电平，适配电源轨的小数坐标，并绕开芯片
async function testAngledRouting() {
    const project = emptyProject();
    project.chips.push({ id: "U1", model: "74LS00", section: 0, column: 20 });
    project.wires = [
        { id: "W1", from: "B0:A:2", to: "B0:J:40", color: "#123456", bends: [] },
        { id: "W2", from: "R:VCC:17", to: "B0:D:20", color: "#654321", bends: [] },
        { id: "W3", from: "B3:J:49", to: "B0:A:49", color: "#1976d2", bends: [] }
    ];
    project.switches[0] = 1;
    const before = structuredClone(project);
    const originalResult = simulate(project, createRuntime());
    const routes = await routeWires(project, 45);
    assert.deepEqual(project, before);
    let diagonal = 0;
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        wire.bends = routes[wire.id];
        wire.angle = 45;
        assert.ok(wire.bends.length <= LIMITS.bends);
        const points = wirePoints(wire, index);
        diagonal = diagonal + assertAngles(points);
    }
    assert.ok(diagonal > 0);
    assert.equal(wiringMetrics(project).chipCrossings, 0);
    const restored = validateProject(project);
    const result = simulate(restored, createRuntime());
    for (const wire of restored.wires) {
        assert.equal(readEndpoint(result, wire.to), readEndpoint(originalResult, wire.to));
    }
    assert.equal(readEndpoint(result, "L0"), 1);
}

// 用完整加法器检查密集线路的斜角整理，端点、线色和芯片位置保持原样
async function testAngledPreset() {
    const project = complementPreset();
    const original = structuredClone(project);
    const routes = await routeWires(project, 45);
    let diagonal = 0;
    let previousCorners = 0;
    let arrangedCorners = 0;
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        wire.bends = routes[wire.id];
        wire.angle = 45;
        assert.ok(wire.bends.length <= LIMITS.bends);
        assert.equal(wire.from, original.wires[index].from);
        assert.equal(wire.to, original.wires[index].to);
        assert.equal(wire.color, original.wires[index].color);
        diagonal = diagonal + assertAngles(wirePoints(wire, index));
        previousCorners = previousCorners + simplifyWirePath(wirePoints(original.wires[index], index)).length - 2;
        arrangedCorners = arrangedCorners + simplifyWirePath(wirePoints(wire, index)).length - 2;
    }
    assert.ok(diagonal > 0);
    assert.ok(arrangedCorners < previousCorners, "整理后的实际拐角应少于旧示例");
    assert.deepEqual(project.chips, original.chips);
    assert.equal(wiringMetrics(project).chipCrossings, 0);
    assert.equal(validateProject(project).wires.length, original.wires.length);
}

test("45°路径覆盖四个方向、轴向和折返", testAngleGeometry);
test("任意方向的路径可检查芯片保护区", testCornerProtection);
test("减少拐角优先于避免导线重叠", testCornerPriority);
test("相同拐角数量优先减少重叠并保留精确端点", testOverlapPriority);
test("45°导线保存、导入、命中和转折点一致", testAngleStorageAndPicking);
test("45°自动整理保持电气结果并绕开芯片", testAngledRouting);
test("61根加法器示例导线支持45°整理", testAngledPreset);
