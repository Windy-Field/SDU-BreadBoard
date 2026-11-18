import { logicGate } from "./chips.mjs";
import { andValues, logicValue, readNumber } from "./chip-logic.mjs";

// 74LS160 的固定状态转移，包含并行装入 10～15 后的自恢复路径
const DECADE_NEXT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11, 4, 13, 4, 15, 0];

// 创建指定数量的未知位，寄存器上电后需要按实际接线清零或置数
function unknownBits(count) {
    const bits = [];
    for (let index = 0; index < count; index = index + 1) {
        bits.push("X");
    }
    return bits;
}

// 为新增时序芯片创建易失状态，时钟历史与输出数据分开记录
export function createChipState(model) {
    let count = 4;
    if (model.sequential === "flipflop") {
        count = 2;
    }
    const clocks = unknownBits(count);
    return { bits: unknownBits(count), inverted: unknownBits(count), clocks: clocks };
}

// 判断历史时钟与当前时钟是否构成指定边沿
function hasEdge(previous, current, edge) {
    if (edge === "falling") {
        return previous === 1 && current === 0;
    }
    return previous === 0 && current === 1;
}

// 未知时钟可能产生有效边沿时返回真，用于阻止输出出现假确定值
function uncertainEdge(previous, current, edge) {
    const first = logicValue(previous);
    const last = logicValue(current);
    if (first !== "X" && last !== "X") {
        return false;
    }
    if (edge === "falling") {
        return first !== 0 && last !== 1;
    }
    return first !== 1 && last !== 0;
}

// 计算 JK 的次态，保持、复位、置位和翻转均可传播未知输入
function nextJk(first, second, previous) {
    if (first === 1 && second === 0) {
        return 1;
    }
    if (first === 0 && second === 1) {
        return 0;
    }
    const previousInverse = logicGate("not", previous, 0);
    const secondInverse = logicGate("not", second, 0);
    const setPart = logicGate("and", first, previousInverse);
    const keepPart = logicGate("and", secondInverse, previous);
    return logicGate("or", setPart, keepPart);
}

// 返回当前边沿应采样的值，D 触发器直接取输入，JK 根据旧值计算
function sampleFlipFlop(channel, pins, previous) {
    if (channel.data) {
        return logicValue(pins[channel.data]);
    }
    return nextJk(pins[channel.first], pins[channel.second], previous);
}

// 更新双触发器；异步端优先，两端同时有效时保持资料规定的双高输出
function updateFlipFlops(model, pins, state) {
    const bits = [];
    const inverted = [];
    let active = 0;
    if (model.activeHigh) {
        active = 1;
    }
    for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        const reset = logicValue(pins[channel.reset]);
        const set = logicValue(pins[channel.set]);
        const previousClock = state.clocks[index];
        const clock = pins[channel.clock];
        let value = state.bits[index];
        let inverse = state.inverted[index];
        if (reset === active && set === active) {
            value = 1;
            inverse = 1;
        } else if (reset === active) {
            value = 0;
            inverse = 1;
        } else if (set === active) {
            value = 1;
            inverse = 0;
        } else if (reset === "X" || set === "X") {
            value = "X";
            inverse = "X";
        } else {
            if (value === inverse) {
                value = "X";
            }
            if (hasEdge(previousClock, clock, model.edge)) {
                value = sampleFlipFlop(channel, pins, value);
            } else if (uncertainEdge(previousClock, clock, model.edge)) {
                const sampled = sampleFlipFlop(channel, pins, value);
                if (sampled !== value) {
                    value = "X";
                }
            }
            inverse = logicGate("not", value, 0);
        }
        bits.push(value);
        inverted.push(inverse);
        state.clocks[index] = logicValue(clock);
    }
    state.bits = bits;
    state.inverted = inverted;
}

// 把四位保存值转为整数，任何一位未知时返回 X
function storedNumber(bits) {
    let value = 0;
    for (let bit = 0; bit < bits.length; bit = bit + 1) {
        if (bits[bit] !== 0 && bits[bit] !== 1) {
            return "X";
        }
        value = value + bits[bit] * (2 ** bit);
    }
    return value;
}

// 将整数写入四位输出，位序与物理脚的低位到高位顺序一致
function numberBits(number) {
    if (number === "X") {
        return unknownBits(4);
    }
    const bits = [];
    for (let bit = 0; bit < 4; bit = bit + 1) {
        bits.push((number >> bit) & 1);
    }
    return bits;
}

// 在确定的计数器上升沿上选择装载、保持或计数，返回新的四位输出
function clockedCounterBits(model, pins, bits) {
    const controls = model.controls;
    const load = pins[controls.load];
    if (load === 0) {
        const number = readNumber(pins, controls.data);
        return numberBits(number);
    }
    if (load !== 1) {
        return unknownBits(4);
    }
    const enable = andValues([pins[controls.enable[0]], pins[controls.enable[1]]]);
    if (enable === 0) {
        return bits;
    }
    const number = storedNumber(bits);
    if (enable === "X" || number === "X") {
        return unknownBits(4);
    }
    if (model.modulus === 10) {
        return numberBits(DECADE_NEXT[number]);
    }
    return numberBits((number + 1) % model.modulus);
}

// 更新计数器，异步清零优先；时钟不确定但能明确保持时不丢弃旧值
function updateCounter(model, pins, state) {
    const controls = model.controls;
    const reset = pins[controls.reset];
    const clock = pins[controls.clock];
    const previousClock = state.clocks[0];
    if (reset === 0) {
        state.bits = [0, 0, 0, 0];
    } else if (reset !== 1) {
        state.bits = unknownBits(4);
    } else if (hasEdge(previousClock, clock, "rising")) {
        state.bits = clockedCounterBits(model, pins, state.bits);
    } else if (uncertainEdge(previousClock, clock, "rising")) {
        const disabled = pins[controls.enable[0]] === 0 || pins[controls.enable[1]] === 0;
        const holds = pins[controls.load] === 1 && disabled;
        if (!holds) {
            state.bits = unknownBits(4);
        }
    }
    state.clocks[0] = logicValue(clock);
}

// 更新双向移位寄存器，数组按 QA、QB、QC、QD 顺序保存
function updateShift(model, pins, state) {
    const controls = model.controls;
    const reset = pins[controls.reset];
    const clock = pins[controls.clock];
    const previousClock = state.clocks[0];
    const mode = readNumber(pins, controls.mode);
    if (reset === 0) {
        state.bits = [0, 0, 0, 0];
    } else if (reset !== 1) {
        state.bits = unknownBits(4);
    } else if (hasEdge(previousClock, clock, "rising")) {
        const previous = state.bits;
        if (mode === 1) {
            const serial = logicValue(pins[controls.right]);
            state.bits = [serial, previous[0], previous[1], previous[2]];
        } else if (mode === 2) {
            const serial = logicValue(pins[controls.left]);
            state.bits = [previous[1], previous[2], previous[3], serial];
        } else if (mode === 3) {
            const bits = [];
            for (const pin of controls.data) {
                bits.push(logicValue(pins[pin]));
            }
            state.bits = bits;
        } else if (mode === "X") {
            state.bits = unknownBits(4);
        }
    } else if (mode !== 0 && uncertainEdge(previousClock, clock, "rising")) {
        state.bits = unknownBits(4);
    }
    state.clocks[0] = logicValue(clock);
}

// 根据稳定输入更新一种新增时序芯片，返回输出是否改变
export function updateChipState(model, pins, state, powered) {
    const before = JSON.stringify([state.bits, state.inverted]);
    if (!powered) {
        state.bits = unknownBits(state.bits.length);
        state.inverted = unknownBits(state.inverted.length);
        state.clocks = unknownBits(state.clocks.length);
    } else if (model.sequential === "flipflop") {
        updateFlipFlops(model, pins, state);
    } else if (model.sequential === "counter") {
        updateCounter(model, pins, state);
    } else if (model.sequential === "shift") {
        updateShift(model, pins, state);
    }
    return before !== JSON.stringify([state.bits, state.inverted]);
}

// 将新增时序芯片保存值映射到物理输出，计数进位由当前使能和计数值组合产生
export function stateOutputs(model, pins, state) {
    const outputs = {};
    if (model.sequential === "flipflop") {
        for (let index = 0; index < model.channels.length; index = index + 1) {
            const channel = model.channels[index];
            outputs[channel.output] = state.bits[index];
            outputs[channel.inverted] = state.inverted[index];
        }
    } else {
        for (let bit = 0; bit < 4; bit = bit + 1) {
            outputs[model.outputs[bit]] = state.bits[bit];
        }
        if (model.sequential === "counter") {
            const number = storedNumber(state.bits);
            let terminal = "X";
            if (number !== "X") {
                terminal = 0;
                if (number === model.modulus - 1) {
                    terminal = 1;
                }
            }
            const controls = model.controls;
            const carryEnable = pins[controls.enable[1]];
            outputs[controls.carry] = logicGate("and", terminal, carryEnable);
        }
    }
    return outputs;
}
