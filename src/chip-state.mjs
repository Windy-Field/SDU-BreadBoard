import { logicGate } from "./chips.mjs";
import { andValues, logicValue, readNumber } from "./chip-logic.mjs";

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
    const setPart = logicGate("and", first, logicGate("not", previous, 0));
    const keepPart = logicGate("and", logicGate("not", second, 0), previous);
    return logicGate("or", setPart, keepPart);
}

// 更新双触发器；异步端优先，两端同时有效时保持资料规定的双高输出
function updateFlipFlops(model, pins, state) {
    const bits = [];
    const inverted = [];
    for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        let active = 0;
        if (model.activeHigh) {
            active = 1;
        }
        const reset = logicValue(pins[channel.reset]);
        const set = logicValue(pins[channel.set]);
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
            if (hasEdge(state.clocks[index], pins[channel.clock], model.edge)) {
                if (channel.data) {
                    value = logicValue(pins[channel.data]);
                } else {
                    value = nextJk(pins[channel.first], pins[channel.second], value);
                }
            } else if (uncertainEdge(state.clocks[index], pins[channel.clock], model.edge)) {
                value = "X";
            }
            inverse = logicGate("not", value, 0);
        }
        bits.push(value);
        inverted.push(inverse);
        state.clocks[index] = logicValue(pins[channel.clock]);
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

// 更新计数器，低有效异步清零优先，同步置数优先于计数使能
function updateCounter(model, pins, state) {
    const edge = hasEdge(state.clocks[0], pins[2], "rising");
    if (pins[1] === 0) {
        state.bits = [0, 0, 0, 0];
    } else if (pins[1] !== 1) {
        state.bits = unknownBits(4);
    } else if (edge) {
        if (pins[9] === 0) {
            state.bits = numberBits(readNumber(pins, [3, 4, 5, 6]));
        } else if (pins[9] !== 1) {
            state.bits = unknownBits(4);
        } else {
            const enable = andValues([pins[7], pins[10]]);
            if (enable === 1) {
                const current = storedNumber(state.bits);
                if (current === "X") {
                    state.bits = unknownBits(4);
                } else if (current === model.modulus - 1) {
                    state.bits = [0, 0, 0, 0];
                } else {
                    state.bits = numberBits((current + 1) & 15);
                }
            } else if (enable === "X") {
                state.bits = unknownBits(4);
            }
        }
    } else if (uncertainEdge(state.clocks[0], pins[2], "rising")) {
        state.bits = unknownBits(4);
    }
    state.clocks[0] = logicValue(pins[2]);
}

// 更新双向移位寄存器，数组按 QA、QB、QC、QD 顺序保存
function updateShift(pins, state) {
    if (pins[1] === 0) {
        state.bits = [0, 0, 0, 0];
    } else if (pins[1] !== 1) {
        state.bits = unknownBits(4);
    } else if (hasEdge(state.clocks[0], pins[2], "rising")) {
        const mode = readNumber(pins, [9, 10]);
        const previous = state.bits;
        if (mode === 1) {
            state.bits = [logicValue(pins[3]), previous[0], previous[1], previous[2]];
        } else if (mode === 2) {
            state.bits = [previous[1], previous[2], previous[3], logicValue(pins[11])];
        } else if (mode === 3) {
            state.bits = [logicValue(pins[4]), logicValue(pins[5]), logicValue(pins[6]), logicValue(pins[7])];
        } else if (mode === "X") {
            state.bits = unknownBits(4);
        }
    } else if (uncertainEdge(state.clocks[0], pins[2], "rising")) {
        state.bits = unknownBits(4);
    }
    state.clocks[0] = logicValue(pins[2]);
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
        updateShift(pins, state);
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
            outputs[15] = logicGate("and", terminal, pins[10]);
        }
    }
    return outputs;
}
