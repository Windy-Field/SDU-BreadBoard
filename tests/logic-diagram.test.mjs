import test from "node:test";
import assert from "node:assert/strict";
import { buildLogicDiagram } from "../src/logic-diagram.mjs";
import { complementPreset } from "../src/presets.mjs";
import { createRuntime, simulate } from "../src/engine.mjs";
import { emptyProject, baseNode, pinHole } from "../src/board.mjs";
import { CHIP_MODELS } from "../src/chips.mjs";
import { createLogicGraph, layoutLogicDiagram, logicDiagramMetrics } from "../src/logic-diagram-layout.mjs";

// 按端点显示文字查找逻辑网络，返回该网络的端点名称
function networkLabelsFor(diagram, firstLabel) {
    for (const network of diagram.nets) {
        let found = false;
        for (const member of network.members) {
            if (member.label === firstLabel) {
                found = true;
            }
        }
        if (found) {
            const labels = [];
            for (const member of network.members) {
                labels.push(member.label);
            }
            return labels;
        }
    }
    return [];
}

// 对照改动前已测量的示例，采用紧凑符号后转角和总线长都应减少
async function testSimplerDiagram() {
    const project = complementPreset();
    const diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
    const graph = await layoutLogicDiagram(diagram);
    const metrics = logicDiagramMetrics(graph);
    assert.ok(metrics.bends < 80, "改动前默认示例有80个真实转角");
    assert.ok(metrics.length < 26606, "改动前默认示例的线长为26606图纸像素");
    for (const item of graph.children) {
        if (!item.body) {
            continue;
        }
        for (const port of item.ports) {
            const horizontal = port.x + port.width / 2;
            const vertical = port.y + port.height / 2;
            assert.ok(horizontal === 0 || horizontal === item.width);
            assert.ok(vertical >= item.body.y && vertical <= item.body.y + item.body.height);
        }
    }
    console.log("逻辑图走线：转角 80 → " + metrics.bends + "，线长 26606 → " + Math.round(metrics.length));
}

// 使用默认实物接线生成图纸数据，核对输入、加法器和寄存器确实在同一网络
function testComplementConnections() {
    const project = complementPreset();
    const result = simulate(project, createRuntime());
    const diagram = buildLogicDiagram(project, result);
    const inputNetwork = networkLabelsFor(diagram, "K0 按键");
    const processedNetwork = networkLabelsFor(diagram, "U4 · 3脚 1Y");
    const sumNetwork = networkLabelsFor(diagram, "U2 · 4脚 Σ1");
    assert.ok(inputNetwork.includes("U4 · 1脚 1A"));
    assert.ok(processedNetwork.includes("U2 · 6脚 B1"));
    assert.ok(sumNetwork.includes("U1 · 3脚 D0"));
    assert.ok(diagram.nets.length > 0);
    assert.equal(diagram.floatingInputs.length, 0);
    assert.equal(inputNetwork.includes("U2 · 6脚 B1"), false);
}

// 逻辑图生成前后，工程、仿真状态和引脚电平表都不应变化
function testReadOnlyDiagram() {
    const project = complementPreset();
    const runtime = createRuntime();
    const result = simulate(project, runtime);
    const before = JSON.stringify({ project: project, runtime: runtime, result: result });
    buildLogicDiagram(project, result);
    assert.equal(JSON.stringify({ project: project, runtime: runtime, result: result }), before);
}

// 每条布局边的两端必须属于同一真实网络，反馈线、分支和脚位不能串接
async function testPhysicalNetworks() {
    const project = complementPreset();
    const result = simulate(project, createRuntime());
    const diagram = buildLogicDiagram(project, result);
    for (const showPower of [false, true]) {
        const graph = await layoutLogicDiagram(diagram, showPower);
        const portNets = new Map();
        for (const item of graph.children) {
            assert.ok(Number.isFinite(item.x) && Number.isFinite(item.y));
            for (const port of item.ports) {
                portNets.set(port.id, port.terminal.netId);
            }
        }
        for (const edge of graph.edges) {
            assert.equal(portNets.get(edge.sources[0]), edge.netId);
            assert.equal(portNets.get(edge.targets[0]), edge.netId);
            assert.ok(edge.sections.length > 0);
            for (const section of edge.sections) {
                const points = [section.startPoint];
                for (const point of section.bendPoints || []) {
                    points.push(point);
                }
                points.push(section.endPoint);
                for (let index = 1; index < points.length; index = index + 1) {
                    const first = points[index - 1];
                    const last = points[index];
                    assert.ok(first.x === last.x || first.y === last.y);
                }
            }
        }
        assert.ok(graph.edges.length > 30);
        assert.ok(graph.width > 0 && graph.height > 0);
    }
}

// 输入直连输出、空白电路和仅有导线的网络都应保留
function testDirectAndLooseWires() {
    const project = emptyProject();
    let diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
    assert.equal(createLogicGraph(diagram).children.length, 0);
    project.wires.push({ id: "W1", from: "B3:A:49", to: "B0:D:49", color: "#1976d2", bends: [] });
    diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
    assert.ok(networkLabelsFor(diagram, "K0 按键").includes("L0 LED"));
    assert.equal(createLogicGraph(diagram).edges.length, 1);
    project.wires.push({ id: "W2", from: "B1:A:1", to: "B1:A:3", color: "#1976d2", bends: [] });
    project.wires.push({ id: "W3", from: "B1:B:3", to: "B1:A:5", color: "#1976d2", bends: [] });
    diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
    assert.equal(createLogicGraph(diagram).edges.length, 4);
    assert.notEqual(baseNode("B1:A:1"), baseNode("B1:F:1"));
}

// 所有型号的信号脚都必须在逻辑元件端口中出现，NC 不得当作输入
function testEveryChipPins() {
    for (const name of Object.keys(CHIP_MODELS)) {
        const project = emptyProject();
        const chip = { id: "U1", model: name, section: 1, column: 10 };
        project.chips.push(chip);
        const diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
        const graph = createLogicGraph(diagram);
        const pins = new Set();
        for (const block of graph.children) {
            for (const port of block.ports) {
                pins.add(port.terminal.pin);
                assert.equal(port.terminal.endpoint, pinHole(chip, port.terminal.pin));
            }
        }
        const model = CHIP_MODELS[name];
        for (const pin of model.inputs.concat(model.outputs)) {
            assert.ok(pins.has(pin), name + " 缺少物理脚 " + pin);
        }
    }
}

// 同一网络存在两个推挽输出时保留两个驱动，不替用户修正错误接线
function testConflictingOutputs() {
    const project = emptyProject();
    const chip = { id: "U1", model: "74LS08", section: 1, column: 10 };
    project.chips.push(chip);
    const first = pinHole(chip, 3).replace(":F:", ":G:");
    const second = pinHole(chip, 6).replace(":F:", ":G:");
    project.wires.push({ id: "W1", from: first, to: second, color: "#1976d2", bends: [] });
    const diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
    const graph = createLogicGraph(diagram);
    const network = networkLabelsFor(diagram, "U1 · 3脚 1Y");
    assert.ok(network.includes("U1 · 6脚 2Y"));
    assert.equal(graph.edges.length, 1);
}

// 各类门沿用矩形逻辑符号，非门和与非门的输出带取反标记
function testRectangularSymbols() {
    const expected = [
        ["74LS08", "&", false],
        ["74LS32", "≥1", false],
        ["74LS86", "=1", false],
        ["74LS00", "&", true],
        ["74LS04", "1", true],
        ["74LS03", "&", true],
        ["74LS20", "&", true],
        ["CD4011", "&", true],
        ["74LS125", "BUF", false]
    ];
    for (const entry of expected) {
        const project = emptyProject();
        project.chips.push({ id: "U1", model: entry[0], section: 1, column: 10 });
        const diagram = buildLogicDiagram(project, simulate(project, createRuntime()));
        for (const block of diagram.blocks) {
            assert.equal(block.symbol, entry[1]);
            assert.equal(block.inverted, entry[2]);
        }
    }
}

test("逻辑连接图按真实连通关系显示补码电路端点", testComplementConnections);
test("逻辑图不会改变电路或仿真状态", testReadOnlyDiagram);
test("自动布局保留真实网络且所有线段正交", testPhysicalNetworks);
test("空白实验、板内直连和裸导线正确显示", testDirectAndLooseWires);
test("全部23种芯片的逻辑图脚位完整", testEveryChipPins);
test("多驱动网络保留所有真实输出", testConflictingOutputs);
test("紧凑逻辑符号减少示例转角并保留外置引脚", testSimplerDiagram);
test("与或非异或及三态门使用正确的矩形符号", testRectangularSymbols);
