import test from "node:test";
import assert from "node:assert/strict";
import { angleWirePath, shortCornerPath, simplifyWirePath, segmentCrossesBounds, WIRE_PATH } from "../src/wire-path.mjs";
import { wirePoints, hitTest, wireHandleAt } from "../src/geometry.mjs";
import { emptyProject, endpointPosition } from "../src/board.mjs";
import { validateProject, LIMITS } from "../src/storage.mjs";
import { routeWires, routeNewWire } from "../src/routing.mjs";
import { createRuntime, simulate, readEndpoint } from "../src/engine.mjs";
import { wiringMetrics } from "./wiring-metrics.mjs";
import { complementPreset } from "../src/presets.mjs";
import { wireDisplayPaths } from "../src/geometry.mjs";

// 检查路径只包含横、竖和 45° 方向，返回斜线段数量
function assertAngles(points) {
    let diagonal = 0;
    for (let index = 1; index < points.length; index = index + 1) {
        const horizontal = Math.abs(points[index].x - points[index - 1].x);
        const vertical = Math.abs(points[index].y - points[index - 1].y);
        assert.ok(horizontal === 0 || vertical === 0 || Math.abs(horizontal - vertical) < 0.000001);
        if (horizontal > 0 && vertical > 0) {
            assert.ok(horizontal <= WIRE_PATH.cornerSize + WIRE_PATH.tolerance, "斜角横向最多一个孔距");
            assert.ok(vertical <= WIRE_PATH.cornerSize + WIRE_PATH.tolerance, "斜角纵向最多一个孔距");
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

// 转角只削去一个孔距，相邻转角、障碍和点数限制不会生成长斜线
function testShortCorners() {
    const points = [{ x: 20, y: 20 }, { x: 180, y: 20 }, { x: 180, y: 160 }, { x: 200, y: 160 }];
    const result = shortCornerPath(points, [], 26);
    assert.equal(assertAngles(result), 2);
    assert.deepEqual(result[0], points[0]);
    assert.deepEqual(result[result.length - 1], points[points.length - 1]);
    assert.deepEqual(angleWirePath(result), result);
    assert.deepEqual(shortCornerPath(points, [], points.length), points);
    const blocked = [{ x: 165, y: 23, width: 12, height: 12 }];
    const protectedPath = shortCornerPath(points, blocked, 26);
    for (let index = 1; index < protectedPath.length; index = index + 1) {
        assert.equal(segmentCrossesBounds(protectedPath[index - 1], protectedPath[index], blocked[0]), false);
    }
    const longDiagonal = angleWirePath([{ x: 20, y: 20 }, { x: 240, y: 240 }]);
    assert.ok(longDiagonal.length > 2);
    assertAngles(longDiagonal);
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
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        wire.bends = routes[wire.id];
        wire.angle = 45;
        assert.ok(wire.bends.length <= LIMITS.bends);
        assert.equal(wire.from, original.wires[index].from);
        assert.equal(wire.to, original.wires[index].to);
        assert.equal(wire.color, original.wires[index].color);
        diagonal = diagonal + assertAngles(wirePoints(wire, index));
    }
    assert.ok(diagonal > 0);
    assert.ok(wiringMetrics(project).overlap < 200, "整板走线应由引擎分开主要共线路径");
    assert.deepEqual(project.chips, original.chips);
    assert.equal(wiringMetrics(project).chipCrossings, 0);
    assert.equal(validateProject(project).wires.length, original.wires.length);
}

// 屏幕与保存路径完全一致，不再依赖额外显示偏移
function testWireDisplaySpacing() {
    const project = emptyProject();
    project.wires.push({ id: "W1", from: "B0:A:1", to: "B0:A:20", color: "#1976d2", bends: [{ x: 260, y: 261 }] });
    project.wires.push({ id: "W2", from: "B0:A:2", to: "B0:A:21", color: "#dc3545", bends: [{ x: 260, y: 261 }] });
    const original = structuredClone(project.wires);
    const paths = wireDisplayPaths(project.wires);
    assert.equal(paths.length, 2);
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        assert.deepEqual(paths[index][0], endpointPosition(wire.from));
        assert.deepEqual(paths[index][paths[index].length - 1], endpointPosition(wire.to));
    }
    assert.notDeepEqual(paths[0], paths[1]);
    assert.deepEqual(project.wires, original);
    for (let index = 0; index < project.wires.length; index = index + 1) {
        assert.deepEqual(paths[index], wirePoints(project.wires[index], index));
    }
}

// 新线使用同一个引擎避障，已有导线不移动，手动转折点仍位于生成路径上
async function testNewWireRouting() {
    const project = emptyProject();
    project.chips.push({ id: "U1", model: "74LS00", section: 0, column: 10 });
    const first = { id: "W1", from: "B0:A:1", to: "B0:J:30", color: "#1976d2", bends: [], angle: 45 };
    first.bends = await routeNewWire(project, first, 45);
    project.wires.push(first);
    const before = structuredClone(project);
    const second = { id: "W2", from: "B0:A:2", to: "B0:J:31", color: "#dc3545", bends: [{ x: 750, y: 80 }], angle: 45 };
    second.bends = await routeNewWire(project, second, 0);
    assert.deepEqual(project, before);
    delete second.angle;
    project.wires.push(second);
    assert.equal(wiringMetrics(project).chipCrossings, 0);
    const points = wirePoints(second, 1);
    let checkpointFound = false;
    const checkpoint = { x: 750, y: 80 };
    for (let index = 1; index < points.length; index = index + 1) {
        const previous = points[index - 1];
        const current = points[index];
        const horizontal = previous.y === current.y && previous.y === checkpoint.y;
        const vertical = previous.x === current.x && previous.x === checkpoint.x;
        const insideX = checkpoint.x >= Math.min(previous.x, current.x) && checkpoint.x <= Math.max(previous.x, current.x);
        const insideY = checkpoint.y >= Math.min(previous.y, current.y) && checkpoint.y <= Math.max(previous.y, current.y);
        if ((horizontal || vertical) && insideX && insideY) {
            checkpointFound = true;
        }
    }
    assert.equal(checkpointFound, true);
    validateProject(project);
}

test("45°路径覆盖四个方向、轴向和折返", testAngleGeometry);
test("任意方向的路径可检查芯片保护区", testCornerProtection);
test("单个斜角最长根号二个孔距并保护相邻转弯", testShortCorners);
test("45°导线保存、导入、命中和转折点一致", testAngleStorageAndPicking);
test("45°自动整理保持电气结果并绕开芯片", testAngledRouting);
test("61根加法器示例导线支持45°整理", testAngledPreset);
test("显示路径与实际保存路径完全一致", testWireDisplaySpacing);
test("逐根接线自动避障并保留旧线和手动转折点", testNewWireRouting);
