import test from "node:test";
import assert from "node:assert/strict";
import { CHIP_MODELS } from "../src/chips.mjs";
import { emptyProject, pinHole, portHole } from "../src/board.mjs";
import { simulate, createRuntime } from "../src/engine.mjs";
import { inspectCircuit } from "../src/diagnostics.mjs";

// 创建任意型号的测试电路，输入默认接K0，电源与地使用真实轨道孔
function createCircuit(modelName) {
    const project = emptyProject();
    const chip = { id: "U1", model: modelName, section: 1, column: 3 };
    project.chips.push(chip);
    const model = CHIP_MODELS[modelName];
    connectPin(project, chip, model.power, portHole("VCC"));
    connectPin(project, chip, model.ground, portHole("GND"));
    for (const pin of model.inputs) {
        if (!model.outputs.includes(pin)) {
            connectPin(project, chip, pin, portHole("K0"));
        }
    }
    return { project: project, chip: chip, runtime: createRuntime() };
}

// 用同列空孔连接芯片引脚，仅用于建立测试电路
function connectPin(project, chip, pin, endpoint) {
    const position = pinHole(chip, pin);
    const upperHole = position.replace(":E:", ":D:");
    const hole = upperHole.replace(":F:", ":G:");
    project.wires.push({ id: "W" + (project.wires.length + 1), from: endpoint, to: hole, color: "#1976d2", bends: [] });
}

// 返回当前诊断，计算过程由仿真执行，诊断本身只读结果
function reportFor(circuit) {
    const result = simulate(circuit.project, circuit.runtime);
    return inspectCircuit(circuit.project, result);
}

// 检查报告里是否存在指定类别，不依赖文案全文
function hasIssue(report, code) {
    for (const issue of report.issues) {
        if (issue.code.startsWith(code)) {
            return true;
        }
    }
    return false;
}

// 普通与门无需符合任何示例，只要供电输入正常就应通过
function testGeneralCircuit() {
    const circuit = createCircuit("74LS08");
    const report = reportFor(circuit);
    assert.equal(report.issues.length, 0);
    assert.equal(report.chips[0].status, "当前条件正常");
    const before = JSON.stringify(circuit);
    const result = simulate(circuit.project, circuit.runtime);
    const settled = JSON.stringify(circuit);
    inspectCircuit(circuit.project, result);
    assert.equal(JSON.stringify(circuit), settled);
    assert.equal(before, settled);
}

// 未供电、悬空输入以及关电时的电源短接都需要明确报告
function testPowerAndFloating() {
    const circuit = createCircuit("74LS08");
    circuit.project.wires.splice(0, 1);
    assert.equal(hasIssue(reportFor(circuit), "power:U1"), true);
    const missing = createCircuit("74LS08");
    missing.project.wires.splice(2, 1);
    assert.equal(hasIssue(reportFor(missing), "floating:U1"), true);
    missing.project.power = false;
    missing.project.wires.push({ id: "W100", from: "R:VCC:0", to: "R:GND:0", color: "#1976d2", bends: [] });
    const report = reportFor(missing);
    assert.equal(hasIssue(report, "power-short"), true);
    assert.equal(report.chips[0].status, "未上电");
}

// 推挽输出即使恰好为低也不能直接接地，OC释放且无上拉应提示
function testOutputConnections() {
    const circuit = createCircuit("74LS08");
    connectPin(circuit.project, circuit.chip, 3, portHole("GND"));
    assert.equal(hasIssue(reportFor(circuit), "output-rail:U1:3"), true);
    const collector = createCircuit("74LS03");
    assert.equal(hasIssue(reportFor(collector), "oc-floating:"), true);
    for (const pin of CHIP_MODELS["74LS03"].outputs) {
        collector.project.pullUps.push(pinHole(collector.chip, pin));
    }
    assert.equal(hasIssue(reportFor(collector), "oc-floating:"), false);
}

// 保持或复位属于正常状态，时钟悬空、未知保存值和异步控制冲突需要指出
function testTimingConditions() {
    const register = createCircuit("74LS273");
    assert.equal(hasIssue(reportFor(register), "state:U1"), false);
    register.project.switches[0] = 1;
    const clock = pinHole(register.chip, 11).replace(":E:", ":D:");
    const kept = [];
    for (const wire of register.project.wires) {
        if (wire.to !== clock) {
            kept.push(wire);
        }
    }
    register.project.wires = kept;
    assert.equal(hasIssue(reportFor(register), "clock:U1:11"), true);
    const counter = createCircuit("74LS161");
    counter.project.switches[0] = 1;
    assert.equal(hasIssue(reportFor(counter), "state:U1"), true);
    const flipflop = createCircuit("74LS74");
    assert.equal(hasIssue(reportFor(flipflop), "async-conflict:"), true);
}

// 不稳定状态必须保留为错误，不能被每片芯片的正常供电结果覆盖
function testUnstableReport() {
    const circuit = createCircuit("74LS08");
    const result = simulate(circuit.project, circuit.runtime);
    result.stable = false;
    const report = inspectCircuit(circuit.project, result);
    assert.equal(hasIssue(report, "unstable"), true);
    assert.equal(report.chips[0].severity, "error");
}

test("通用诊断不要求标准示例且不修改状态", testGeneralCircuit);
test("供电悬空与关电短路诊断", testPowerAndFloating);
test("输出硬接电源与OC缺上拉诊断", testOutputConnections);
test("清零等待时钟和异步冲突诊断", testTimingConditions);
test("不稳定反馈诊断", testUnstableReport);
