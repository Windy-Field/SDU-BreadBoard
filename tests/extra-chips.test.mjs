import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CHIP_MODELS } from "../src/chips.mjs";
import { EXTRA_CHIPS } from "../src/extra-chips.mjs";
import { evaluateExtra } from "../src/chip-logic.mjs";
import { createChipState, updateChipState, stateOutputs } from "../src/chip-state.mjs";
import { emptyProject, pinHole } from "../src/board.mjs";
import { simulate, createRuntime, readEndpoint } from "../src/engine.mjs";
import { validateProject } from "../src/storage.mjs";

// 原厂命名与材料位编号的对应关系，物理脚号不随显示名称变化
const ADDER_LABELS = ["", "Σ2", "B2", "A2", "Σ1", "A1", "B1", "C0", "GND", "C4", "Σ4", "B4", "A4", "Σ3", "A3", "B3", "VCC"];
const NAND_SYMMETRIC_LABELS = { 9: "3B", 10: "3A", 12: "4B", 13: "4A" };

// 创建按真实物理脚号索引的低电平输入表
function pinsFor(model) {
    const pins = {};
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
        pins[pin] = 0;
    }
    pins[model.power] = 1;
    return pins;
}

// 把整数依次写入低位到高位的输入脚
function writeNumber(pins, order, value) {
    for (let bit = 0; bit < order.length; bit = bit + 1) {
        pins[order[bit]] = (value >> bit) & 1;
    }
}

// 将输出脚按低位到高位组合成整数，任何未知值都会使测试失败
function readNumber(outputs, order) {
    let value = 0;
    for (let bit = 0; bit < order.length; bit = bit + 1) {
        assert.ok(outputs[order[bit]] === 0 || outputs[order[bit]] === 1);
        value = value + outputs[order[bit]] * (2 ** bit);
    }
    return value;
}

// 对照从 DOCX 独立提取的引脚表，而不是用实现本身生成期望值
function testDocumentPins() {
    const source = JSON.parse(fs.readFileSync(new URL("./fixtures/chip-reference.json", import.meta.url), "utf8"));
    assert.equal(Object.keys(EXTRA_CHIPS).length, 16);
    assert.equal(Object.keys(CHIP_MODELS).length, 23);
    for (const name of Object.keys(source)) {
        const model = CHIP_MODELS[name];
        assert.equal(model.count, source[name].count, name);
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            const supplied = source[name].pins[String(pin)].label;
            const implemented = model.labels[pin];
            let expected = supplied;
            if (name === "74LS283") {
                expected = ADDER_LABELS[pin];
            }
            if (name === "74LS00") {
                if (Object.hasOwn(NAND_SYMMETRIC_LABELS, pin)) {
                    expected = NAND_SYMMETRIC_LABELS[pin];
                }
            }
            if (name === "74LS85" && pin >= 2 && pin <= 4) {
                expected = expected + "输入";
            }
            assert.equal(implemented, expected, name + " 第 " + pin + " 脚");
        }
        const image = new URL("../assets/pinouts/document/" + name.toLowerCase() + "-1.png", import.meta.url);
        assert.ok(fs.statSync(image).size > 1000);
    }
}

// 穷举新增门电路和三态缓冲器的全部输入组合
function testGates() {
    for (const name of ["74LS03", "CD4011", "74LS20", "74LS125"]) {
        const model = CHIP_MODELS[name];
        for (let input = 0; input < 2 ** model.inputs.length; input = input + 1) {
            const pins = pinsFor(model);
            writeNumber(pins, model.inputs, input);
            const output = evaluateExtra(model, pins);
            for (const gate of model.gates) {
                let expected = 1;
                if (name === "74LS125") {
                    expected = pins[gate[1]];
                    if (pins[gate[0]] === 1) {
                        expected = "Z";
                    }
                } else {
                    let allHigh = true;
                    for (let index = 0; index < gate.length - 1; index = index + 1) {
                        if (pins[gate[index]] !== 1) {
                            allHigh = false;
                        }
                    }
                    if (allHigh) {
                        expected = 0;
                    } else if (name === "74LS03") {
                        expected = "Z";
                    }
                }
                assert.equal(output[gate[gate.length - 1]], expected, name);
            }
        }
    }
}

// 穷举译码器使能和地址，检查两组独立输出
function testDecoders() {
    for (const name of ["74LS138", "74LS139"]) {
        const model = CHIP_MODELS[name];
        for (let value = 0; value < 2 ** model.inputs.length; value = value + 1) {
            const pins = pinsFor(model);
            writeNumber(pins, model.inputs, value);
            const output = evaluateExtra(model, pins);
            let groups = [{ enable: pins[6] === 1 && pins[4] === 0 && pins[5] === 0, address: pins[1] + pins[2] * 2 + pins[3] * 4, order: [15, 14, 13, 12, 11, 10, 9, 7] }];
            if (name === "74LS139") {
                groups = [{ enable: pins[1] === 0, address: pins[2] + pins[3] * 2, order: [4, 5, 6, 7] }, { enable: pins[15] === 0, address: pins[14] + pins[13] * 2, order: [12, 11, 10, 9] }];
            }
            for (const group of groups) {
                for (let index = 0; index < group.order.length; index = index + 1) {
                    let expected = 1;
                    if (group.enable && group.address === index) {
                        expected = 0;
                    }
                    assert.equal(output[group.order[index]], expected, name);
                }
            }
        }
    }
}

// 穷举两个选择器的全部输入、地址和使能组合
function testMultiplexers() {
    for (const name of ["74LS151", "74LS153"]) {
        const model = CHIP_MODELS[name];
        for (let value = 0; value < 2 ** model.inputs.length; value = value + 1) {
            const pins = pinsFor(model);
            writeNumber(pins, model.inputs, value);
            const output = evaluateExtra(model, pins);
            if (name === "74LS151") {
                const address = pins[11] + pins[10] * 2 + pins[9] * 4;
                const inputs = [4, 3, 2, 1, 15, 14, 13, 12];
                let expected = 0;
                if (pins[7] === 0) {
                    expected = pins[inputs[address]];
                }
                assert.equal(output[5], expected);
                assert.equal(output[6], 1 - expected);
            } else {
                const address = pins[14] + pins[2] * 2;
                const first = [6, 5, 4, 3];
                const second = [10, 11, 12, 13];
                let firstValue = 0;
                let secondValue = 0;
                if (pins[1] === 0) {
                    firstValue = pins[first[address]];
                }
                if (pins[15] === 0) {
                    secondValue = pins[second[address]];
                }
                assert.equal(output[7], firstValue);
                assert.equal(output[9], secondValue);
            }
        }
    }
}

// 穷举比较器数值和级联控制，验证小于、等于、大于的优先关系
function testComparator() {
    const model = CHIP_MODELS["74LS85"];
    for (let first = 0; first < 16; first = first + 1) {
        for (let second = 0; second < 16; second = second + 1) {
            for (let cascade = 0; cascade < 8; cascade = cascade + 1) {
                const pins = pinsFor(model);
                writeNumber(pins, [10, 12, 14, 15], first);
                writeNumber(pins, [9, 11, 13, 1], second);
                writeNumber(pins, [2, 3, 4], cascade);
                const output = evaluateExtra(model, pins);
                const expected = { 5: 0, 6: 0, 7: 0 };
                if (first > second) {
                    expected[5] = 1;
                } else if (first < second) {
                    expected[7] = 1;
                } else if (pins[3] === 1) {
                    expected[6] = 1;
                } else {
                    expected[5] = 1 - pins[2];
                    expected[7] = 1 - pins[4];
                }
                assert.deepEqual(output, expected);
            }
        }
    }
}

// 验证数字字形、灭零、强制灭灯和灯测试的控制优先级
function testSegments() {
    const model = CHIP_MODELS["74LS48"];
    const expected = [63, 6, 91, 79, 102, 109, 124, 7, 127, 103];
    for (let value = 0; value < 10; value = value + 1) {
        const pins = pinsFor(model);
        writeNumber(pins, [7, 1, 2, 6], value);
        pins[3] = 1;
        pins[4] = 1;
        pins[5] = 1;
        assert.equal(readNumber(evaluateExtra(model, pins), [13, 12, 11, 10, 9, 15, 14]), expected[value]);
        pins[3] = 0;
        assert.equal(readNumber(evaluateExtra(model, pins), [13, 12, 11, 10, 9, 15, 14]), 127);
        pins[4] = 0;
        assert.equal(readNumber(evaluateExtra(model, pins), [13, 12, 11, 10, 9, 15, 14]), 0);
    }
    const zero = pinsFor(model);
    zero[3] = 1;
    zero[4] = 1;
    assert.equal(evaluateExtra(model, zero)[4], 0);
    assert.equal(readNumber(evaluateExtra(model, zero), [13, 12, 11, 10, 9, 15, 14]), 0);
}

// 为触发器设置非活动的异步控制端并建立初始时钟电平
function configureFlipFlop(model, pins, state) {
    for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        let inactive = 1;
        if (model.activeHigh) {
            inactive = 0;
        }
        pins[channel.reset] = inactive;
        pins[channel.set] = inactive;
        pins[channel.clock] = 0;
        state.clocks[index] = 0;
    }
}

// 穷举 D 和 JK 触发器的有效边沿、数据和异步控制组合
function testFlipFlops() {
    for (const name of ["74LS74", "74LS112", "CD4027"]) {
        const model = CHIP_MODELS[name];
        for (let previous = 0; previous < 2; previous = previous + 1) {
            for (let input = 0; input < 4; input = input + 1) {
                for (let channelIndex = 0; channelIndex < 2; channelIndex = channelIndex + 1) {
                    const pins = pinsFor(model);
                    const state = createChipState(model);
                    configureFlipFlop(model, pins, state);
                    const channel = model.channels[channelIndex];
                    state.bits[channelIndex] = previous;
                    state.inverted[channelIndex] = 1 - previous;
                    const first = input & 1;
                    const second = (input >> 1) & 1;
                    let expected = first;
                    if (channel.data) {
                        pins[channel.data] = first;
                    } else {
                        pins[channel.first] = first;
                        pins[channel.second] = second;
                        expected = previous;
                        if (first === 0 && second === 1) {
                            expected = 0;
                        } else if (first === 1 && second === 0) {
                            expected = 1;
                        } else if (first === 1 && second === 1) {
                            expected = 1 - previous;
                        }
                    }
                    if (model.edge === "falling") {
                        state.clocks[channelIndex] = 1;
                        pins[channel.clock] = 0;
                    } else {
                        pins[channel.clock] = 1;
                    }
                    updateChipState(model, pins, state, true);
                    assert.equal(stateOutputs(model, pins, state)[channel.output], expected, name);
                    assert.equal(stateOutputs(model, pins, state)[channel.inverted], 1 - expected);
                    updateChipState(model, pins, state, true);
                    assert.equal(state.bits[channelIndex], expected, "相同时钟电平不能重复触发");
                    let active = 0;
                    if (model.activeHigh) {
                        active = 1;
                    }
                    pins[channel.reset] = active;
                    updateChipState(model, pins, state, true);
                    assert.equal(state.bits[channelIndex], 0);
                    pins[channel.set] = active;
                    updateChipState(model, pins, state, true);
                    assert.equal(state.bits[channelIndex], 1);
                    assert.equal(state.inverted[channelIndex], 1);
                }
            }
        }
    }
}

// 验证计数、同步装载、保持和 RCO；每一步都经过低高时钟转换
function testCounters() {
    for (const name of ["74LS160", "74LS161"]) {
        const model = CHIP_MODELS[name];
        const pins = pinsFor(model);
        const state = createChipState(model);
        updateChipState(model, pins, state, true);
        pins[1] = 1;
        pins[9] = 1;
        pins[7] = 1;
        pins[10] = 1;
        for (let step = 1; step <= model.modulus * 2; step = step + 1) {
            pins[2] = 0;
            updateChipState(model, pins, state, true);
            pins[2] = 1;
            updateChipState(model, pins, state, true);
            const expected = step % model.modulus;
            const output = stateOutputs(model, pins, state);
            assert.equal(readNumber(output, [14, 13, 12, 11]), expected, name);
            assert.equal(output[15], Number(expected === model.modulus - 1));
        }
        pins[9] = 0;
        pins[7] = 0;
        writeNumber(pins, [3, 4, 5, 6], 5);
        pins[2] = 0;
        updateChipState(model, pins, state, true);
        assert.equal(readNumber(stateOutputs(model, pins, state), [14, 13, 12, 11]), 0);
        pins[2] = 1;
        updateChipState(model, pins, state, true);
        assert.equal(readNumber(stateOutputs(model, pins, state), [14, 13, 12, 11]), 5);
        pins[9] = 1;
        pins[2] = 0;
        updateChipState(model, pins, state, true);
        pins[2] = 1;
        updateChipState(model, pins, state, true);
        assert.equal(readNumber(stateOutputs(model, pins, state), [14, 13, 12, 11]), 5);
    }
}

// 穷举移位寄存器的原值、模式和串行输入，核对两个移位方向
function testShift() {
    const model = CHIP_MODELS["74LS194"];
    for (let original = 0; original < 16; original = original + 1) {
        for (let mode = 0; mode < 4; mode = mode + 1) {
            for (let serial = 0; serial < 4; serial = serial + 1) {
                const pins = pinsFor(model);
                const state = createChipState(model);
                state.bits = [];
                for (let bit = 0; bit < 4; bit = bit + 1) {
                    state.bits.push((original >> bit) & 1);
                }
                state.clocks[0] = 0;
                pins[1] = 1;
                pins[2] = 1;
                pins[3] = serial & 1;
                pins[11] = (serial >> 1) & 1;
                writeNumber(pins, [9, 10], mode);
                writeNumber(pins, [4, 5, 6, 7], 10);
                let expected = original;
                if (mode === 1) {
                    expected = ((original << 1) & 15) | pins[3];
                } else if (mode === 2) {
                    expected = (original >> 1) | (pins[11] << 3);
                } else if (mode === 3) {
                    expected = 10;
                }
                updateChipState(model, pins, state, true);
                assert.equal(readNumber(stateOutputs(model, pins, state), [12, 13, 14, 15]), expected);
                pins[1] = 0;
                updateChipState(model, pins, state, true);
                assert.deepEqual(state.bits, [0, 0, 0, 0]);
            }
        }
    }
}

// 取得引脚同列空孔，测试接线不直接占用芯片已经插入的孔
function availablePinHole(chip, pin) {
    const position = pinHole(chip, pin);
    const upperHole = position.replace(":E:", ":D:");
    return upperHole.replace(":F:", ":G:");
}

// 创建一片接好电源的芯片，每个输入通过独立 K 端驱动
function wiredChip(name) {
    const project = emptyProject();
    const chip = { id: "U1", model: name, section: 0, column: 10 };
    const model = CHIP_MODELS[name];
    project.chips.push(chip);
    const assigned = {};
    const pairs = [[model.power, "VCC"], [model.ground, "GND"]];
    for (let index = 0; index < model.inputs.length; index = index + 1) {
        const pin = model.inputs[index];
        assigned[pin] = index;
        if (model.bidirectional && model.bidirectional.includes(pin)) {
            const hole = availablePinHole(chip, pin);
            project.pullUps.push(hole);
        } else {
            pairs.push([pin, "K" + index]);
        }
    }
    for (const pair of pairs) {
        const hole = availablePinHole(chip, pair[0]);
        project.wires.push({ id: "W" + (project.wires.length + 1), from: pair[1], to: hole, color: "#1976d2", bends: [] });
    }
    const physical = validateProject(project);
    project.wires = physical.wires;
    return { project: project, chip: chip, assigned: assigned, runtime: createRuntime() };
}

// 更新线接输入后计算电路，读值仍通过物理引脚所在节点
function runWired(harness, pins) {
    for (const pin of Object.keys(harness.assigned)) {
        harness.project.switches[harness.assigned[pin]] = pins[pin];
    }
    return simulate(harness.project, harness.runtime);
}

// 所有新增芯片至少通过一次真实供电与接线传播，并测试三态和 OC 上拉
function testWiredIntegration() {
    for (const name of Object.keys(EXTRA_CHIPS)) {
        const model = CHIP_MODELS[name];
        const harness = wiredChip(name);
        const pins = pinsFor(model);
        if (model.kind === "seven-segment") {
            pins[3] = 1;
            pins[4] = 1;
            pins[5] = 1;
        }
        const result = runWired(harness, pins);
        assert.ok(result.stable, name + " 必须稳定");
        if (!model.sequential) {
            const expected = evaluateExtra(model, pins);
            for (const pin of model.outputs) {
                let value = expected[pin];
                if (model.bidirectional && model.bidirectional.includes(pin) && value === "Z") {
                    value = 1;
                }
                assert.equal(readEndpoint(result, pinHole(harness.chip, pin)), value, name + " 第 " + pin + " 脚");
            }
        }
    }
    const harness = wiredChip("74LS03");
    const output = pinHole(harness.chip, 3);
    let result = runWired(harness, pinsFor(CHIP_MODELS["74LS03"]));
    assert.equal(readEndpoint(result, output), "Z");
    harness.project.pullUps.push(output);
    result = simulate(harness.project, harness.runtime);
    assert.equal(readEndpoint(result, output), 1);
    harness.project.switches[0] = 1;
    harness.project.switches[1] = 1;
    result = simulate(harness.project, harness.runtime);
    assert.equal(readEndpoint(result, output), 0);
    assert.equal(result.issues.length, 0);
}

// 沿真实连线触发新增时序芯片，确认同一电平不会重复计数或采样
function testWiredSequential() {
    for (const name of ["74LS74", "74LS112", "CD4027", "74LS160", "74LS161", "74LS194"]) {
        const model = CHIP_MODELS[name];
        const harness = wiredChip(name);
        const pins = pinsFor(model);
        if (model.channels) {
            const dummy = createChipState(model);
            configureFlipFlop(model, pins, dummy);
            for (const channel of model.channels) {
                pins[channel.reset] = 0;
                if (model.activeHigh) {
                    pins[channel.reset] = 1;
                }
            }
            runWired(harness, pins);
            for (const channel of model.channels) {
                pins[channel.reset] = 1;
                if (model.activeHigh) {
                    pins[channel.reset] = 0;
                }
                if (channel.data) {
                    pins[channel.data] = 1;
                } else {
                    pins[channel.first] = 1;
                    pins[channel.second] = 1;
                }
                pins[channel.clock] = 0;
                if (model.edge === "falling") {
                    pins[channel.clock] = 1;
                }
            }
            runWired(harness, pins);
            for (const channel of model.channels) {
                pins[channel.clock] = 1;
                if (model.edge === "falling") {
                    pins[channel.clock] = 0;
                }
            }
            const result = runWired(harness, pins);
            for (const channel of model.channels) {
                assert.equal(readEndpoint(result, pinHole(harness.chip, channel.output)), 1, name);
            }
            const held = runWired(harness, pins);
            for (const channel of model.channels) {
                assert.equal(readEndpoint(held, pinHole(harness.chip, channel.output)), 1, name + " 保持");
            }
        } else {
            runWired(harness, pins);
            pins[1] = 1;
            pins[2] = 0;
            if (model.sequential === "counter") {
                pins[7] = 1;
                pins[9] = 1;
                pins[10] = 1;
            } else {
                pins[9] = 1;
                pins[10] = 1;
                pins[4] = 1;
            }
            runWired(harness, pins);
            pins[2] = 1;
            const result = runWired(harness, pins);
            assert.equal(readEndpoint(result, pinHole(harness.chip, model.outputs[0])), 1, name);
            assert.equal(readEndpoint(runWired(harness, pins), pinHole(harness.chip, model.outputs[0])), 1, name + " 保持");
        }
    }
}

// 两个 OC 输出可以并接；弱上拉只在没有低电平驱动时把节点拉高
function testOpenCollectorBus() {
    const harness = wiredChip("74LS03");
    const chip = harness.chip;
    const first = pinHole(chip, 3).replace(":F:", ":H:");
    const second = pinHole(chip, 6).replace(":F:", ":H:");
    harness.project.wires.push({ id: "W99", from: first, to: second, color: "#1976d2", bends: [] });
    harness.project.pullUps.push(first);
    const pins = pinsFor(CHIP_MODELS["74LS03"]);
    assert.equal(readEndpoint(runWired(harness, pins), first), 1);
    pins[1] = 1;
    pins[2] = 1;
    const result = runWired(harness, pins);
    assert.equal(readEndpoint(result, second), 0);
    assert.equal(result.issues.length, 0);
}

// 灭零释放后，BI/RBO 必须重新接受外部上拉，不能锁在自己的下拉状态
function testBlankingRecovery() {
    const harness = wiredChip("74LS48");
    const pins = pinsFor(CHIP_MODELS["74LS48"]);
    pins[3] = 1;
    pins[4] = 1;
    pins[5] = 0;
    const blank = runWired(harness, pins);
    assert.equal(readEndpoint(blank, pinHole(harness.chip, 4)), 0);
    pins[7] = 1;
    const visible = runWired(harness, pins);
    assert.equal(readEndpoint(visible, pinHole(harness.chip, 4)), 1);
    assert.equal(readEndpoint(visible, pinHole(harness.chip, 12)), 1);
    assert.equal(visible.stable, true);
}

test("材料芯片逐脚匹配文档和原厂命名", testDocumentPins);
test("新增门电路与三态门全部输入", testGates);
test("译码器全部地址与使能", testDecoders);
test("数据选择器全部输入组合", testMultiplexers);
test("比较器全部数值与级联状态", testComparator);
test("七段译码字形和控制优先级", testSegments);
test("双D和JK触发器边沿与异步控制", testFlipFlops);
test("十进制和二进制计数器", testCounters);
test("双向移位全部模式", testShift);
test("新增芯片物理接线与OC上拉", testWiredIntegration);
test("新增时序芯片实际连线及保持", testWiredSequential);
test("OC输出线与及上拉", testOpenCollectorBus);
test("七段译码灭零释放恢复", testBlankingRecovery);
