import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CHIP_MODELS } from "../../src/chips/chips.mjs";
import { CHIP_REFERENCES } from "../../src/chips/catalog.mjs";
import { evaluateExtra } from "../../src/chips/chip-logic.mjs";
import { createMemory, memoryOutputs, updateMemory } from "../../src/chips/chip-memory.mjs";
import { emptyProject, pinHole, portHole } from "../../src/board/board.mjs";
import { createRuntime, simulate, readEndpoint } from "../../src/simulation/engine.mjs";
import { validateProject } from "../../src/storage/storage.mjs";
import { inspectCircuit } from "../../src/simulation/diagnostics.mjs";
import { buildLogicDiagram } from "../../src/diagram/logic-diagram.mjs";
import { layoutLogicDiagram } from "../../src/diagram/logic-diagram-layout.mjs";
import { ramPreset, RAM_INPUTS, RAM_EXPERIMENT_ID } from "../../src/experiments/ram-preset.mjs";
import { ensureRamExperiment, validateWorkspace } from "../../src/storage/workspace.mjs";
import { complementPreset } from "../../src/experiments/presets.mjs";
import { wiringMetrics } from "../helpers/wiring-metrics.mjs";

// 课件第6、7页的物理脚序，独立记录以免测试跟随模型一起出错
const RAM_LABELS = ["", "A7", "A6", "A5", "A4", "A3", "A2", "A1", "A0", "D0", "D1", "D2", "GND", "D3", "D4", "D5", "D6", "D7", "CE′", "A10", "OE′", "WE′", "A9", "A8", "VCC"];
const BUFFER_LABELS = ["", "1G′", "1A1", "2Y4", "1A2", "2Y3", "1A3", "2Y2", "1A4", "2Y1", "GND", "2A1", "1Y4", "2A2", "1Y3", "2A3", "1Y2", "2A4", "1Y1", "2G′", "VCC"];
const RAM_ADDRESS = [8, 7, 6, 5, 4, 3, 2, 1, 23, 22, 19];
const RAM_DATA = [9, 10, 11, 13, 14, 15, 16, 17];
const BUFFER_INPUT = [2, 4, 6, 8, 11, 13, 15, 17];
const BUFFER_OUTPUT = [18, 16, 14, 12, 9, 7, 5, 3];

// 给指定脚序写入整数，每个脚序都按低位优先排列
function setNumber(pins, order, number) {
    for (let bit = 0; bit < order.length; bit = bit + 1) {
        pins[order[bit]] = (number >> bit) & 1;
    }
}

// 创建一片 RAM 的独立引脚输入，默认禁止写入并允许读取
function ramPins(address = 0) {
    const pins = { 18: 0, 20: 0, 21: 1 };
    setNumber(pins, RAM_ADDRESS, address);
    return pins;
}

// 对照完整八位输出，不允许把 X 或 Z 当成数字
function expectByte(outputs, number) {
    for (let bit = 0; bit < RAM_DATA.length; bit = bit + 1) {
        assert.equal(outputs[RAM_DATA[bit]], (number >> bit) & 1, "数据位 " + bit);
    }
}

// 检查两片芯片逐脚匹配课件，资料图片确实来自本地课件
function testCoursePins() {
    assert.deepEqual(CHIP_MODELS["6116"].labels, RAM_LABELS);
    assert.deepEqual(CHIP_MODELS["74LS244"].labels, BUFFER_LABELS);
    assert.deepEqual(CHIP_MODELS["6116"].memory.address, RAM_ADDRESS);
    for (const name of ["6116", "74LS244"]) {
        assert.ok(fs.statSync(CHIP_REFERENCES[name].image).size > 100);
    }
}

// 穷举缓冲器两个使能与全部数据，验证每组四路独立且不反相
function testBuffer() {
    const model = CHIP_MODELS["74LS244"];
    for (let enable = 0; enable < 4; enable = enable + 1) {
        for (let number = 0; number < 256; number = number + 1) {
            const pins = { 1: enable & 1, 19: (enable >> 1) & 1 };
            setNumber(pins, BUFFER_INPUT, number);
            const outputs = evaluateExtra(model, pins);
            for (let bit = 0; bit < 8; bit = bit + 1) {
                let expected = (number >> bit) & 1;
                let control = pins[1];
                if (bit >= 4) {
                    control = pins[19];
                }
                if (control === 1) {
                    expected = "Z";
                }
                assert.equal(outputs[BUFFER_OUTPUT[bit]], expected);
            }
        }
    }
    for (const control of ["X", "Z"]) {
        const pins = { 1: control, 19: 1 };
        setNumber(pins, BUFFER_INPUT, 255);
        const outputs = evaluateExtra(model, pins);
        assert.equal(outputs[18], "X");
        assert.equal(outputs[9], "Z");
    }
}

// 写满全部2048个地址后集中读回，覆盖高位地址和所有数据取值
function testFullMemory() {
    const specification = CHIP_MODELS["6116"].memory;
    const state = createMemory(specification);
    const initial = memoryOutputs(specification, ramPins(), state);
    assert.equal(initial[9], "X");
    for (let address = 0; address < 2048; address = address + 1) {
        const pins = ramPins(address);
        pins[21] = 0;
        const value = memoryPattern(address);
        setNumber(pins, RAM_DATA, value);
        updateMemory(specification, pins, state, true);
        assert.equal(memoryOutputs(specification, pins, state)[9], "Z");
    }
    for (let address = 0; address < 2048; address = address + 1) {
        const expected = memoryPattern(address);
        expectByte(memoryOutputs(specification, ramPins(address), state), expected);
    }
    const pins = ramPins(2047);
    pins[18] = 1;
    pins[21] = 0;
    setNumber(pins, RAM_DATA, 0);
    updateMemory(specification, pins, state, true);
    pins[18] = 0;
    pins[21] = 1;
    const expected = memoryPattern(2047);
    expectByte(memoryOutputs(specification, pins, state), expected);
    updateMemory(specification, pins, state, false);
    assert.equal(memoryOutputs(specification, pins, state)[9], "X");
}

// 根据地址生成测试字节，高位地址也参与计算，便于发现地址线遗漏
function memoryPattern(address) {
    const highAddress = Math.floor(address / 256);
    const mixed = address * 73 + highAddress;
    return mixed % 256;
}

// 未知地址只能影响匹配的单元，未知控制不能被当成禁止写入
function testUnknownMemory() {
    const specification = CHIP_MODELS["6116"].memory;
    const state = createMemory(specification);
    for (let address = 0; address < 3; address = address + 1) {
        const pins = ramPins(address);
        pins[21] = 0;
        setNumber(pins, RAM_DATA, 0);
        updateMemory(specification, pins, state, true);
    }
    const uncertain = ramPins(0);
    uncertain[8] = "X";
    assert.equal(memoryOutputs(specification, uncertain, state)[9], 0);
    uncertain[21] = 0;
    setNumber(uncertain, RAM_DATA, 1);
    updateMemory(specification, uncertain, state, true);
    assert.equal(memoryOutputs(specification, ramPins(0), state)[9], "X");
    assert.equal(memoryOutputs(specification, ramPins(1), state)[9], "X");
    expectByte(memoryOutputs(specification, ramPins(2), state), 0);
    const floating = ramPins(2);
    floating[21] = "Z";
    setNumber(floating, RAM_DATA, 255);
    updateMemory(specification, floating, state, true);
    assert.equal(memoryOutputs(specification, ramPins(2), state)[9], "X");
    for (const controls of [[1, 0, 1], [0, 1, 1], [0, 0, 0]]) {
        const pins = ramPins();
        pins[18] = controls[0];
        pins[20] = controls[1];
        pins[21] = controls[2];
        for (const value of Object.values(memoryOutputs(specification, pins, state))) {
            assert.equal(value, "Z");
        }
    }
}

// 写有效期间数据持续进入单元，OE只控制读输出，不参与写入许可
function testContinuousWrite() {
    const specification = CHIP_MODELS["6116"].memory;
    const state = createMemory(specification);
    const pins = ramPins(42);
    pins[21] = 0;
    for (const reading of [0, 1, "X", "Z"]) {
        pins[20] = reading;
        setNumber(pins, RAM_DATA, 85);
        updateMemory(specification, pins, state, true);
        expectByte(memoryOutputs(specification, ramPins(42), state), 85);
        setNumber(pins, RAM_DATA, 170);
        updateMemory(specification, pins, state, true);
        expectByte(memoryOutputs(specification, ramPins(42), state), 170);
    }
    pins[9] = "Z";
    updateMemory(specification, pins, state, true);
    const outputs = memoryOutputs(specification, ramPins(42), state);
    assert.equal(outputs[9], "X");
    assert.equal(outputs[10], 1, "单个位悬空不应破坏其他数据位");
    const independent = createMemory(specification);
    assert.equal(memoryOutputs(specification, ramPins(42), independent)[10], "X");
}

// 使用芯片同列空孔接线，参数为电路、用孔表和两端，避免占用芯片脚
function connect(project, usage, first, second) {
    const from = freeEndpoint(project, usage, first);
    const to = freeEndpoint(project, usage, second);
    project.wires.push({ id: "W" + (project.wires.length + 1), from: from, to: to, color: "#1976d2", bends: [] });
}

// 将芯片脚或板载端口分配到同一电气节点的空孔
function freeEndpoint(project, usage, name) {
    let endpoint = portHole(name);
    if (name.startsWith("U")) {
        const parts = name.split("-");
        for (const chip of project.chips) {
            if (chip.id === parts[0]) {
                endpoint = pinHole(chip, Number(parts[1]));
            }
        }
    }
    if (endpoint.startsWith("R:")) {
        return endpoint;
    }
    const parts = endpoint.split(":");
    let rows = "JIHG";
    if (parts[1] === "E" || parts[1] === "A") {
        rows = "DCBA";
    }
    let index = 0;
    if (Object.hasOwn(usage, endpoint)) {
        index = usage[endpoint];
    }
    assert.ok(index < rows.length, "测试节点空孔不足 " + name);
    usage[endpoint] = index + 1;
    return parts[0] + ":" + rows[index] + ":" + parts[2];
}

// 建立完整11位片内地址、8位数据和译码器控制的两片RAM测试电路
function createRamCircuit() {
    const project = emptyProject();
    project.inputCount = 24;
    project.chips = [
        { id: "U1", model: "6116", section: 1, column: 3 },
        { id: "U2", model: "6116", section: 1, column: 30 },
        { id: "U3", model: "74LS244", section: 2, column: 3 },
        { id: "U4", model: "74LS138", section: 2, column: 30 }
    ];
    const usage = {};
    let power = "VCC";
    let ground = "GND";
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        const powerPin = chip.id + "-" + model.power;
        const groundPin = chip.id + "-" + model.ground;
        connect(project, usage, power, powerPin);
        connect(project, usage, ground, groundPin);
        power = powerPin;
        ground = groundPin;
    }
    for (let bit = 0; bit < 11; bit = bit + 1) {
        const firstPin = "U1-" + RAM_ADDRESS[bit];
        connect(project, usage, "K" + bit, firstPin);
        connect(project, usage, firstPin, "U2-" + RAM_ADDRESS[bit]);
    }
    for (let bit = 0; bit < 8; bit = bit + 1) {
        const bufferPin = "U3-" + BUFFER_OUTPUT[bit];
        const firstPin = "U1-" + RAM_DATA[bit];
        const secondPin = "U2-" + RAM_DATA[bit];
        connect(project, usage, "K" + (12 + bit), "U3-" + BUFFER_INPUT[bit]);
        connect(project, usage, bufferPin, firstPin);
        connect(project, usage, firstPin, secondPin);
        connect(project, usage, secondPin, "L" + bit);
    }
    connect(project, usage, "K11", "U4-1");
    for (const pin of [2, 3, 4, 5]) {
        const nextGround = "U4-" + pin;
        connect(project, usage, ground, nextGround);
        ground = nextGround;
    }
    connect(project, usage, power, "U4-6");
    connect(project, usage, "U4-15", "U1-18");
    connect(project, usage, "U4-14", "U2-18");
    // 两片RAM共用读写控制，K20控制写入，K21控制读取
    connect(project, usage, "K20", "U1-21");
    connect(project, usage, "U1-21", "U2-21");
    connect(project, usage, "K21", "U1-20");
    connect(project, usage, "U1-20", "U2-20");
    connect(project, usage, "K22", "U3-1");
    connect(project, usage, "U3-1", "U3-19");
    project.switches[20] = 1;
    project.switches[21] = 1;
    project.switches[22] = 1;
    return { project: validateProject(project), runtime: createRuntime() };
}

// 调整完整12位地址及数据开关，返回本次稳定仿真结果
function runCircuit(circuit, address, number) {
    for (let bit = 0; bit < 12; bit = bit + 1) {
        circuit.project.switches[bit] = (address >> bit) & 1;
    }
    for (let bit = 0; bit < 8; bit = bit + 1) {
        circuit.project.switches[12 + bit] = (number >> bit) & 1;
    }
    const result = simulate(circuit.project, circuit.runtime);
    assert.equal(result.stable, true);
    return result;
}

// 模拟先准备总线再写入、先结束写入再隔离的实际操作
function writeCircuit(circuit, address, number) {
    circuit.project.switches[21] = 1;
    circuit.project.switches[22] = 0;
    runCircuit(circuit, address, number);
    circuit.project.switches[20] = 0;
    runCircuit(circuit, address, number);
    circuit.project.switches[20] = 1;
    runCircuit(circuit, address, number);
    circuit.project.switches[22] = 1;
    runCircuit(circuit, address, number);
}

// 通过LED端点读取结果，必须逐位与预期数据一致
function expectCircuitByte(result, number) {
    for (let bit = 0; bit < 8; bit = bit + 1) {
        assert.equal(readEndpoint(result, "L" + bit), (number >> bit) & 1);
    }
}

// 验证课件四组数据及跨高地址访问，同时检查冲突、断电和保存格式
async function testWiredMemory() {
    const circuit = createRamCircuit();
    const samples = [[10, 85], [5, 170], [2058, 255], [2053, 0], [2047, 37], [4095, 218]];
    for (const sample of samples) {
        writeCircuit(circuit, sample[0], sample[1]);
    }
    circuit.project.switches[21] = 0;
    for (const sample of samples) {
        const result = runCircuit(circuit, sample[0], 0);
        expectCircuitByte(result, sample[1]);
        assert.equal(inspectCircuit(circuit.project, result).issues.length, 0);
    }
    const result = runCircuit(circuit, 10, 0);
    const before = JSON.stringify(circuit);
    const diagram = buildLogicDiagram(circuit.project, result);
    const graph = await layoutLogicDiagram(diagram);
    assert.ok(graph.edges.length > 0);
    const terminalIds = new Set();
    for (const block of graph.children) {
        for (const port of block.ports) {
            assert.equal(terminalIds.has(port.id), false, "共享使能脚不能产生重复端口编号");
            terminalIds.add(port.id);
        }
    }
    assert.equal(JSON.stringify(circuit), before, "逻辑图不能改变RAM内容");
    let bidirectional = 0;
    for (const block of diagram.blocks) {
        if (block.chipId === "U1") {
            for (const terminal of block.terminals) {
                if (terminal.direction === "bidirectional") {
                    bidirectional = bidirectional + 1;
                }
            }
        }
    }
    assert.equal(bidirectional, 8);
    const restored = validateProject(JSON.parse(JSON.stringify(circuit.project)));
    assert.deepEqual(restored, circuit.project);
    assert.equal(Object.hasOwn(restored, "devices"), false);
    const fresh = simulate(restored, createRuntime());
    assert.equal(readEndpoint(fresh, "L0"), "X");
    circuit.project.switches[22] = 0;
    const conflict = runCircuit(circuit, 10, 0);
    assert.equal(readEndpoint(conflict, "L0"), "X");
    assert.ok(conflict.issues.length > 0, "RAM和缓冲器同时驱动必须报告冲突");
    circuit.project.switches[22] = 1;
    expectCircuitByte(runCircuit(circuit, 10, 0), 85);
    circuit.project.power = false;
    assert.equal(readEndpoint(runCircuit(circuit, 10, 0), "L0"), "Z");
    circuit.project.power = true;
    assert.equal(readEndpoint(runCircuit(circuit, 10, 0), "L0"), "X");
}

// 缓冲器提前断开时写入未知值，不能把高阻自动解释成低电平
function testWriteOrder() {
    const circuit = createRamCircuit();
    writeCircuit(circuit, 5, 170);
    circuit.project.switches[22] = 0;
    circuit.project.switches[20] = 0;
    runCircuit(circuit, 5, 255);
    circuit.project.switches[22] = 1;
    runCircuit(circuit, 5, 255);
    circuit.project.switches[20] = 1;
    circuit.project.switches[21] = 0;
    assert.equal(readEndpoint(runCircuit(circuit, 5, 0), "L0"), "X");
}

test("6116与74LS244逐脚匹配第三次实验课件", testCoursePins);
test("74LS244全部数据和分组使能", testBuffer);
test("6116完整2K地址读写、保持与断电", testFullMemory);
test("6116未知地址与未知写控制", testUnknownMemory);
test("6116持续写入、OE独立和逐位未知状态", testContinuousWrite);
test("两片RAM译码扩展、隔离、冲突、存档和逻辑图", testWiredMemory);
test("RAM写入未结束就隔离会丢失确定数据", testWriteOrder);

// 通过示例规定的输入位设置地址和数据，不借用芯片内部状态
function setPresetAddress(project, address, number) {
    for (let bit = 0; bit < 4; bit = bit + 1) {
        project.switches[RAM_INPUTS.addressStart + bit] = (address >> bit) & 1;
    }
    project.switches[RAM_INPUTS.bank] = (address >> 11) & 1;
    for (let bit = 0; bit < 8; bit = bit + 1) {
        project.switches[RAM_INPUTS.dataStart + bit] = (number >> bit) & 1;
    }
}

// 验证实际交付的示例接线，四组数据写完后集中读取并检查安全初值
function testRamPreset() {
    const project = validateProject(ramPreset());
    const runtime = createRuntime();
    const initial = simulate(project, runtime);
    assert.equal(readEndpoint(initial, "L0"), "Z");
    assert.equal(inspectCircuit(project, initial).issues.length, 0);
    assert.equal(wiringMetrics(project).chipCrossings, 0);
    const samples = [[10, 85], [5, 170], [2058, 255], [2053, 0]];
    for (const sample of samples) {
        setPresetAddress(project, sample[0], sample[1]);
        project.switches[RAM_INPUTS.isolate] = 0;
        simulate(project, runtime);
        project.switches[RAM_INPUTS.write] = 0;
        simulate(project, runtime);
        project.switches[RAM_INPUTS.write] = 1;
        simulate(project, runtime);
        project.switches[RAM_INPUTS.isolate] = 1;
        simulate(project, runtime);
    }
    project.switches[RAM_INPUTS.read] = 0;
    for (const sample of samples) {
        setPresetAddress(project, sample[0], 0);
        const result = simulate(project, runtime);
        expectCircuitByte(result, sample[1]);
        assert.equal(inspectCircuit(project, result).issues.length, 0);
    }
    assert.equal(project.chips.length, 4);
    assert.equal(project.inputCount, 16);
    assert.equal(project.outputCount, 8);
}

// 补入第二份存档时保持旧实验、选择和已有RAM修改，重复启动不增加副本
function testRamWorkspace() {
    const first = complementPreset();
    first.notes = "用户原有备注";
    const blank = emptyProject();
    const workspace = { version: 1, activeId: "first", projects: { first: first, custom: blank } };
    const before = JSON.stringify(workspace.projects);
    assert.equal(ensureRamExperiment(workspace), true);
    assert.deepEqual(Object.keys(workspace.projects), ["first", RAM_EXPERIMENT_ID, "custom"]);
    assert.equal(workspace.activeId, "first");
    assert.equal(JSON.stringify({ first: workspace.projects.first, custom: workspace.projects.custom }), before);
    workspace.projects[RAM_EXPERIMENT_ID].notes = "已修改的RAM备注";
    assert.equal(ensureRamExperiment(workspace), false);
    assert.equal(workspace.projects[RAM_EXPERIMENT_ID].notes, "已修改的RAM备注");
    assert.deepEqual(validateWorkspace(workspace), workspace);
}

test("RAM交付示例读写四组课件数据且走线避开芯片", testRamPreset);
test("RAM第二份存档兼容旧实验并避免重复添加", testRamWorkspace);
