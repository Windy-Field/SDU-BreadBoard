import test from "node:test";
import assert from "node:assert/strict";
import { CHIP_MODELS, evaluateAdder, logicGate } from "../src/chips.mjs";
import { evaluateExtra } from "../src/chip-logic.mjs";
import { createChipState, updateChipState, stateOutputs } from "../src/chip-state.mjs";
import { emptyProject, pinHole, portHole } from "../src/board.mjs";
import { createRuntime, simulate, readEndpoint } from "../src/engine.mjs";

// 独立记录原厂表的七段字形和非 BCD 状态恢复顺序，不从实现中取得期望值
const SEGMENT_MASKS = [63, 6, 91, 79, 102, 109, 124, 7, 127, 103, 88, 76, 98, 105, 120, 0];
const DECADE_NEXT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11, 4, 13, 4, 15, 0];

// 按低位优先顺序把整数拆成固定位数的数组
function bitsOf(number, count) {
    const bits = [];
    for (let index = 0; index < count; index = index + 1) {
        bits.push((number >> index) & 1);
    }
    return bits;
}

// 用独立真值计算全部门电路输入，不复用被测门逻辑
function testAllGateModels() {
    const names = ["74LS00", "74LS08", "74LS32", "74LS04", "74LS86", "74LS03", "74LS20", "CD4011", "74LS125"];
    for (const name of names) {
        const model = CHIP_MODELS[name];
        for (const gate of model.gates) {
            for (let input = 0; input < 2 ** (gate.length - 1); input = input + 1) {
                const pins = {};
                for (let index = 0; index < gate.length - 1; index = index + 1) {
                    pins[gate[index]] = (input >> index) & 1;
                }
                let actual;
                let expected;
                if (model.operation) {
                    const first = pins[gate[0]];
                    const second = pins[gate[1]];
                    actual = logicGate(model.operation, first, second);
                    if (model.operation === "not") {
                        expected = 1 - first;
                    } else if (model.operation === "xor") {
                        expected = first ^ second;
                    } else if (model.operation === "and") {
                        expected = first & second;
                    } else if (model.operation === "or") {
                        expected = first | second;
                    } else {
                        expected = 1 - (first & second);
                    }
                } else {
                    actual = evaluateExtra(model, pins)[gate[gate.length - 1]];
                    if (name === "74LS125") {
                        expected = pins[gate[1]];
                        if (pins[gate[0]] === 1) {
                            expected = "Z";
                        }
                    } else {
                        expected = 0;
                        for (let index = 0; index < gate.length - 1; index = index + 1) {
                            if (pins[gate[index]] === 0) {
                                expected = 1;
                            }
                        }
                        if (name === "74LS03" && expected === 1) {
                            expected = "Z";
                        }
                    }
                }
                assert.equal(actual, expected, name + " 输入 " + input);
            }
        }
    }
}

// 加法器在多数进位已确定时，不应被另一未知输入错误地变为 X
function testUnknownCarry() {
    for (const values of [[1, "X", 1], ["X", 1, 1], [0, "X", 0], ["X", 0, 0]]) {
        const pins = { 5: values[0], 6: values[1], 7: values[2], 3: 0, 2: 0, 14: 0, 15: 0, 12: 0, 11: 0 };
        const output = evaluateAdder(pins);
        let expected = 0;
        if (values[0] === 1 || values[1] === 1) {
            expected = 1;
        }
        assert.equal(output[1], expected);
    }
}

// 逐一核对 16 种七段字形、灯测试、灭灯、灭零及 RBO 输出
function testAllSegmentControls() {
    const model = CHIP_MODELS["74LS48"];
    const order = [13, 12, 11, 10, 9, 15, 14];
    for (let number = 0; number < 16; number = number + 1) {
        for (let control = 0; control < 8; control = control + 1) {
            const pins = { 7: number & 1, 1: (number >> 1) & 1, 2: (number >> 2) & 1, 6: (number >> 3) & 1, 3: control & 1, 4: (control >> 1) & 1, 5: (control >> 2) & 1 };
            const output = evaluateExtra(model, pins);
            let expected = SEGMENT_MASKS[number];
            if (pins[4] === 0) {
                expected = 0;
            } else if (pins[3] === 0) {
                expected = 127;
            } else if (number === 0 && pins[5] === 0) {
                expected = 0;
            }
            for (let index = 0; index < order.length; index = index + 1) {
                assert.equal(output[order[index]], (expected >> index) & 1, "数字 " + number + " 控制 " + control);
            }
            let blanking = "Z";
            if (pins[3] === 1 && number === 0 && pins[5] === 0) {
                blanking = 0;
            }
            assert.equal(output[4], blanking);
        }
    }
}

// 未知 JK 状态可由明确置位或复位恢复，时钟未知但保持模式时不丢失状态
function testSequentialUnknowns() {
    for (const name of ["74LS112", "CD4027"]) {
        const model = CHIP_MODELS[name];
        const channel = model.channels[0];
        for (const target of [0, 1]) {
            const state = createChipState(model);
            const pins = {};
            for (const entry of model.channels) {
                let inactive = 1;
                if (model.activeHigh) {
                    inactive = 0;
                }
                pins[entry.reset] = inactive;
                pins[entry.set] = inactive;
                pins[entry.clock] = 0;
                pins[entry.first] = target;
                pins[entry.second] = 1 - target;
            }
            state.clocks[0] = 0;
            pins[channel.clock] = 1;
            if (model.edge === "falling") {
                state.clocks[0] = 1;
                pins[channel.clock] = 0;
            }
            updateChipState(model, pins, state, true);
            assert.equal(state.bits[0], target, name + " 未知状态恢复");
        }
    }
    const counter = CHIP_MODELS["74LS161"];
    const held = createChipState(counter);
    held.bits = [1, 0, 1, 0];
    held.clocks[0] = 0;
    updateChipState(counter, { 1: 1, 2: "X", 9: 1, 7: 0, 10: 1 }, held, true);
    assert.deepEqual(held.bits, [1, 0, 1, 0]);
    const shift = createChipState(CHIP_MODELS["74LS194"]);
    shift.bits = [1, 0, 1, 0];
    shift.clocks[0] = 0;
    updateChipState(CHIP_MODELS["74LS194"], { 1: 1, 2: "X", 9: 0, 10: 0 }, shift, true);
    assert.deepEqual(shift.bits, [1, 0, 1, 0]);
}

// 穷举两种计数器的全部初值、装载值和三个模式输入，包含非 BCD 状态
function testAllCounterControls() {
    for (const name of ["74LS160", "74LS161"]) {
        const model = CHIP_MODELS[name];
        for (let stored = 0; stored < 16; stored = stored + 1) {
            for (let data = 0; data < 16; data = data + 1) {
                for (let control = 0; control < 8; control = control + 1) {
                    const state = createChipState(model);
                    state.bits = bitsOf(stored, 4);
                    state.clocks[0] = 0;
                    const pins = { 1: 1, 2: 1, 3: data & 1, 4: (data >> 1) & 1, 5: (data >> 2) & 1, 6: (data >> 3) & 1, 9: control & 1, 7: (control >> 1) & 1, 10: (control >> 2) & 1 };
                    let expected = stored;
                    if (pins[9] === 0) {
                        expected = data;
                    } else if (pins[7] === 1 && pins[10] === 1) {
                        expected = (stored + 1) % 16;
                        if (name === "74LS160") {
                            expected = DECADE_NEXT[stored];
                        }
                    }
                    updateChipState(model, pins, state, true);
                    assert.deepEqual(state.bits, bitsOf(expected, 4), name + " 初值 " + stored);
                    const output = stateOutputs(model, pins, state);
                    assert.equal(output[15], Number(expected === model.modulus - 1 && pins[10] === 1));
                }
            }
        }
    }
}

// 添加测试用真实接线，端点可指定芯片脚号，避免使用虚拟板载孔
function connect(project, chip, pin, endpoint) {
    const hole = pinHole(chip, pin);
    const physical = hole.replace(":E:", ":D:").replace(":F:", ":G:");
    project.wires.push({ id: "W" + (project.wires.length + 1), from: endpoint, to: physical, color: "#1976d2", bends: [] });
}

// 两个共用时钟的 D 触发器必须同时取旧值，不能按芯片顺序串行穿透
function testSharedClock() {
    const project = emptyProject();
    const first = { id: "U1", model: "74LS74", section: 1, column: 3 };
    const second = { id: "U2", model: "74LS74", section: 1, column: 20 };
    project.chips.push(first, second);
    for (const chip of project.chips) {
        connect(project, chip, 14, portHole("VCC"));
        connect(project, chip, 7, portHole("GND"));
        connect(project, chip, 1, portHole("K0"));
        connect(project, chip, 4, portHole("VCC"));
        connect(project, chip, 3, portHole("K1"));
        connect(project, chip, 10, portHole("VCC"));
        connect(project, chip, 13, portHole("GND"));
        connect(project, chip, 11, portHole("GND"));
        connect(project, chip, 12, portHole("GND"));
    }
    connect(project, first, 2, portHole("K2"));
    connect(project, second, 2, pinHole(first, 5).replace(":F:", ":H:"));
    const runtime = createRuntime();
    simulate(project, runtime);
    project.switches[0] = 1;
    project.switches[2] = 1;
    simulate(project, runtime);
    project.switches[1] = 1;
    const result = simulate(project, runtime);
    assert.equal(readEndpoint(result, pinHole(first, 5)), 1);
    assert.equal(readEndpoint(result, pinHole(second, 5)), 0);
}

// 所有型号断电后均不驱动输出，正确供电时电源脚必须保持 1 和 0
function testEveryChipPower() {
    for (const name of Object.keys(CHIP_MODELS)) {
        const model = CHIP_MODELS[name];
        const project = emptyProject();
        const chip = { id: "U1", model: name, section: 1, column: 3 };
        project.chips.push(chip);
        connect(project, chip, model.power, portHole("VCC"));
        connect(project, chip, model.ground, portHole("GND"));
        for (const pin of model.inputs) {
            if (!model.outputs.includes(pin)) {
                connect(project, chip, pin, portHole("K0"));
            }
        }
        const runtime = createRuntime();
        const powered = simulate(project, runtime);
        assert.equal(readEndpoint(powered, pinHole(chip, model.power)), 1, name);
        assert.equal(readEndpoint(powered, pinHole(chip, model.ground)), 0, name);
        project.power = false;
        const off = simulate(project, runtime);
        for (const pin of model.outputs) {
            assert.equal(readEndpoint(off, pinHole(chip, pin)), "Z", name + " 断电输出");
        }
    }
}

// 验证74LS273全部八位数据、下降沿保持、异步清零及数据变化不穿透
function testFullRegister() {
    const project = emptyProject();
    const chip = { id: "U1", model: "74LS273", section: 1, column: 3 };
    const model = CHIP_MODELS[chip.model];
    project.chips.push(chip);
    connect(project, chip, 20, portHole("VCC"));
    connect(project, chip, 10, portHole("GND"));
    connect(project, chip, 1, portHole("K8"));
    connect(project, chip, 11, portHole("K9"));
    for (let bit = 0; bit < 8; bit = bit + 1) {
        connect(project, chip, model.data[bit], portHole("K" + bit));
    }
    const runtime = createRuntime();
    simulate(project, runtime);
    project.switches[8] = 1;
    for (let number = 0; number < 256; number = number + 1) {
        project.switches[9] = 0;
        simulate(project, runtime);
        for (let bit = 0; bit < 8; bit = bit + 1) {
            project.switches[bit] = (number >> bit) & 1;
        }
        simulate(project, runtime);
        project.switches[9] = 1;
        let result = simulate(project, runtime);
        for (let bit = 0; bit < 8; bit = bit + 1) {
            assert.equal(readEndpoint(result, pinHole(chip, model.outputs[bit])), (number >> bit) & 1);
            project.switches[bit] = 1 - project.switches[bit];
        }
        result = simulate(project, runtime);
        for (let bit = 0; bit < 8; bit = bit + 1) {
            assert.equal(readEndpoint(result, pinHole(chip, model.outputs[bit])), (number >> bit) & 1);
        }
    }
    project.switches[8] = 0;
    const cleared = simulate(project, runtime);
    for (const pin of model.outputs) {
        assert.equal(readEndpoint(cleared, pinHole(chip, pin)), 0);
    }
}

// BI/RBO开路由内部上拉保持高，数字6和9按原厂字形显示，外部下拉可覆盖高段
function testSegmentDrive() {
    const project = emptyProject();
    const chip = { id: "U1", model: "74LS48", section: 1, column: 3 };
    project.chips.push(chip);
    connect(project, chip, 16, portHole("VCC"));
    connect(project, chip, 8, portHole("GND"));
    connect(project, chip, 3, portHole("K4"));
    connect(project, chip, 5, portHole("K5"));
    const order = [7, 1, 2, 6];
    for (let bit = 0; bit < 4; bit = bit + 1) {
        connect(project, chip, order[bit], portHole("K" + bit));
    }
    project.switches[4] = 1;
    project.switches[5] = 1;
    const runtime = createRuntime();
    let result = simulate(project, runtime);
    assert.equal(readEndpoint(result, pinHole(chip, 4)), 1);
    assert.deepEqual(result.issues, []);
    project.switches[5] = 0;
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, pinHole(chip, 4)), 0);
    project.switches[0] = 1;
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, pinHole(chip, 4)), 1);
    assert.deepEqual(result.issues, []);
    // 数字1的b段为高，连接到地后由内部上拉释放，不应误报强驱动短接
    connect(project, chip, 12, portHole("GND"));
    result = simulate(project, runtime);
    assert.equal(readEndpoint(result, pinHole(chip, 12)), 0);
    assert.deepEqual(result.issues, []);
}

// 全局电源开启但芯片VCC未连接时，内部上拉也不能给BI/RBO供电
function testUnpoweredSegmentBias() {
    const project = emptyProject();
    const chip = { id: "U1", model: "74LS48", section: 1, column: 3 };
    project.chips.push(chip);
    connect(project, chip, 8, portHole("GND"));
    const result = simulate(project, createRuntime());
    assert.equal(readEndpoint(result, pinHole(chip, 4)), "Z");
    for (const pin of CHIP_MODELS[chip.model].outputs) {
        assert.equal(readEndpoint(result, pinHole(chip, pin)), "Z");
    }
}

// 使能无效时译码器和选择器不受未知地址影响，三态缓冲不驱动总线
function testDisabledUnknownInputs() {
    const decoder = evaluateExtra(CHIP_MODELS["74LS138"], { 1: "X", 2: "X", 3: "X", 4: 1, 5: "X", 6: "X" });
    for (const pin of CHIP_MODELS["74LS138"].outputs) {
        assert.equal(decoder[pin], 1);
    }
    const mux = evaluateExtra(CHIP_MODELS["74LS151"], { 7: 1 });
    assert.equal(mux[5], 0);
    assert.equal(mux[6], 1);
    const buffer = evaluateExtra(CHIP_MODELS["74LS125"], { 1: 1, 4: 1, 10: 1, 13: 1 });
    for (const pin of CHIP_MODELS["74LS125"].outputs) {
        assert.equal(buffer[pin], "Z");
    }
    const comparator = evaluateExtra(CHIP_MODELS["74LS85"], { 15: 1, 1: 0 });
    assert.deepEqual(comparator, { 5: 1, 6: 0, 7: 0 });
}

// 两路触发器分别测试全部异步组合，双有效输出双高，释放后需有效时钟恢复
function testAllAsyncControls() {
    for (const name of ["74LS74", "74LS112", "CD4027"]) {
        const model = CHIP_MODELS[name];
        let active = 0;
        if (model.activeHigh) {
            active = 1;
        }
        for (let index = 0; index < model.channels.length; index = index + 1) {
            const channel = model.channels[index];
            for (let controls = 0; controls < 4; controls = controls + 1) {
                const state = createChipState(model);
                const pins = {};
                state.bits[index] = 0;
                state.inverted[index] = 1;
                state.clocks[index] = 0;
                pins[channel.clock] = 0;
                pins[channel.set] = 1 - active;
                pins[channel.reset] = 1 - active;
                let output = 0;
                let inverted = 1;
                if ((controls & 1) !== 0) {
                    pins[channel.set] = active;
                    output = 1;
                    inverted = 0;
                }
                if ((controls & 2) !== 0) {
                    pins[channel.reset] = active;
                    output = 0;
                    inverted = 1;
                }
                if (controls === 3) {
                    output = 1;
                    inverted = 1;
                }
                updateChipState(model, pins, state, true);
                assert.equal(state.bits[index], output, name);
                assert.equal(state.inverted[index], inverted, name);
                if (controls === 3) {
                    pins[channel.set] = 1 - active;
                    pins[channel.reset] = 1 - active;
                    updateChipState(model, pins, state, true);
                    assert.equal(state.bits[index], "X", name + " 双有效同时释放");
                }
            }
        }
    }
}

// 两片同步计数器共用时钟，高位只在低位的旧值到达末态时递增
function testCounterCascade() {
    const project = emptyProject();
    const low = { id: "U1", model: "74LS160", section: 1, column: 3 };
    const high = { id: "U2", model: "74LS160", section: 2, column: 3 };
    project.chips.push(low, high);
    for (const chip of project.chips) {
        connect(project, chip, 16, portHole("VCC"));
        connect(project, chip, 8, portHole("GND"));
        connect(project, chip, 1, portHole("K0"));
        connect(project, chip, 2, portHole("K1"));
        connect(project, chip, 9, portHole("VCC"));
        connect(project, chip, 10, portHole("VCC"));
        for (const pin of [3, 4, 5, 6]) {
            connect(project, chip, pin, portHole("GND"));
        }
    }
    connect(project, low, 7, portHole("VCC"));
    connect(project, high, 7, pinHole(low, 15).replace(":E:", ":D:"));
    const runtime = createRuntime();
    simulate(project, runtime);
    project.switches[0] = 1;
    for (let count = 1; count <= 100; count = count + 1) {
        project.switches[1] = 0;
        simulate(project, runtime);
        project.switches[1] = 1;
        const result = simulate(project, runtime);
        for (let bit = 0; bit < 4; bit = bit + 1) {
            const pin = CHIP_MODELS[low.model].outputs[bit];
            assert.equal(readEndpoint(result, pinHole(low, pin)), ((count % 10) >> bit) & 1);
            assert.equal(readEndpoint(result, pinHole(high, pin)), ((Math.floor(count / 10) % 10) >> bit) & 1);
        }
        assert.deepEqual(result.issues, []);
    }
}

test("九种门芯片逐门全部二值输入", testAllGateModels);
test("加法器进位的未知输入抑制", testUnknownCarry);
test("74LS48全部字形与128种控制组合", testAllSegmentControls);
test("JK未知状态恢复与未知时钟保持", testSequentialUnknowns);
test("计数器4096种装载使能和非法BCD状态", testAllCounterControls);
test("共同时钟两级触发器同时采样", testSharedClock);
test("23种芯片供电与断电输出", testEveryChipPower);
test("74LS273全部256种数据与时钟保持", testFullRegister);
test("74LS48内部上拉与灭零恢复", testSegmentDrive);
test("未接电源的74LS48内部上拉不驱动节点", testUnpoweredSegmentBias);
test("使能禁止时屏蔽未知数据和地址", testDisabledUnknownInputs);
test("两路D和JK全部异步控制组合", testAllAsyncControls);
test("两片十进制计数器同步级联100个脉冲", testCounterCascade);
