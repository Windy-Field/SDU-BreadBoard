import { logicGate } from "./chips.mjs";

// 74LS48 固定字形与脚号，字形顺序为 a、b、c、d、e、f、g
const SEGMENT_PATTERNS = ["1111110", "0110000", "1101101", "1111001", "0110011", "1011011", "0011111", "1110000", "1111111", "1110011", "0001101", "0011001", "0100011", "1001011", "0001111", "0000000"];
const SEGMENT_PINS = [13, 12, 11, 10, 9, 15, 14];
// 比较器位序从高到低，确定高位大小后不再受低位未知值影响
const COMPARE_FIRST = [15, 14, 12, 10];
const COMPARE_SECOND = [1, 13, 11, 9];

// 把输入整理为数字逻辑值，悬空不会被当成确定的 0
export function logicValue(value) {
    if (value === 0 || value === 1) {
        return value;
    }
    return "X";
}

// 对一组输入执行与运算，允许一个确定的 0 抑制未知输入
export function andValues(values) {
    let result = 1;
    for (const value of values) {
        result = logicGate("and", result, value);
    }
    return result;
}

// 读取按低位到高位排列的引脚，存在未知输入时返回 X
export function readNumber(pins, order) {
    let result = 0;
    for (let bit = 0; bit < order.length; bit = bit + 1) {
        const value = logicValue(pins[order[bit]]);
        if (value === "X") {
            return "X";
        }
        result = result + value * (2 ** bit);
    }
    return result;
}

// 返回与给定地址位相符的所有选择项，未知地址只扩大候选范围
function possibleAddresses(pins, order) {
    const possible = [];
    for (let number = 0; number < 2 ** order.length; number = number + 1) {
        let matches = true;
        for (let bit = 0; bit < order.length; bit = bit + 1) {
            const value = logicValue(pins[order[bit]]);
            if (value !== "X" && value !== ((number >> bit) & 1)) {
                matches = false;
            }
        }
        if (matches) {
            possible.push(number);
        }
    }
    return possible;
}

// 所有候选值相同才返回确定结果，否则保留 X
function commonValue(values) {
    const first = values[0];
    for (const value of values) {
        if (value !== first) {
            return "X";
        }
    }
    return first;
}

// 根据地址和使能计算低有效译码输出
function decode(pins, addressPins, enable, outputPins, outputs) {
    const addresses = possibleAddresses(pins, addressPins);
    for (let index = 0; index < outputPins.length; index = index + 1) {
        const candidates = [];
        for (const address of addresses) {
            let match = 0;
            if (address === index) {
                match = 1;
            }
            const active = logicGate("and", enable, match);
            candidates.push(logicGate("not", active, 0));
        }
        outputs[outputPins[index]] = commonValue(candidates);
    }
}

// 计算一个数据选择器，禁止时输出低电平
function multiplex(pins, addressPins, dataPins, enable) {
    const candidates = [];
    for (const address of possibleAddresses(pins, addressPins)) {
        candidates.push(logicValue(pins[dataPins[address]]));
    }
    return logicGate("and", enable, commonValue(candidates));
}

// 计算比较器级联结果，相等时按级联端的真值规则传播
function compare(pins, outputs) {
    outputs[5] = "X";
    outputs[6] = "X";
    outputs[7] = "X";
    for (let bit = 0; bit < COMPARE_FIRST.length; bit = bit + 1) {
        const first = logicValue(pins[COMPARE_FIRST[bit]]);
        const second = logicValue(pins[COMPARE_SECOND[bit]]);
        if (first === "X" || second === "X") {
            return;
        }
        if (first !== second) {
            outputs[5] = 0;
            outputs[6] = 0;
            outputs[7] = 0;
            if (first > second) {
                outputs[5] = 1;
            } else {
                outputs[7] = 1;
            }
            return;
        }
    }
    outputs[6] = logicValue(pins[3]);
    const notEqual = logicGate("not", pins[3], 0);
    const notLess = logicGate("not", pins[2], 0);
    const notGreater = logicGate("not", pins[4], 0);
    outputs[5] = logicGate("and", notEqual, notLess);
    outputs[7] = logicGate("and", notEqual, notGreater);
}

// 译码七段输出，位序为 a、b、c、d、e、f、g；4 脚只下拉或释放
function sevenSegment(pins, outputs) {
    const number = readNumber(pins, [7, 1, 2, 6]);
    const blankZero = number === 0 && pins[5] === 0 && pins[3] === 1;
    outputs[4] = "Z";
    if (blankZero) {
        outputs[4] = 0;
    }
    for (let index = 0; index < SEGMENT_PINS.length; index = index + 1) {
        let value = "X";
        if (pins[4] === 0 || blankZero) {
            value = 0;
        } else if (pins[3] === 0 && pins[4] === 1) {
            value = 1;
        } else if (pins[3] === 1 && pins[4] === 1 && number !== "X") {
            if (number !== 0 || pins[5] === 1) {
                value = Number(SEGMENT_PATTERNS[number][index]);
            } else if (pins[5] === 0) {
                value = 0;
            }
        }
        outputs[SEGMENT_PINS[index]] = value;
    }
}

// 计算文档新增的组合芯片，返回实际物理输出脚及电平
export function evaluateExtra(model, pins) {
    const outputs = {};
    if (model.kind === "cmos-nand" || model.kind === "open-collector" || model.kind === "nand4" || model.kind === "tristate") {
        for (const gate of model.gates) {
            const outputPin = gate[gate.length - 1];
            let value = "X";
            if (model.kind === "tristate") {
                if (pins[gate[0]] === 1) {
                    value = "Z";
                } else if (pins[gate[0]] === 0) {
                    value = logicValue(pins[gate[1]]);
                }
            } else {
                const inputs = [];
                for (let index = 0; index < gate.length - 1; index = index + 1) {
                    inputs.push(pins[gate[index]]);
                }
                value = logicGate("not", andValues(inputs), 0);
                if (model.kind === "open-collector" && value === 1) {
                    value = "Z";
                }
            }
            outputs[outputPin] = value;
        }
    } else if (model.kind === "decoder8") {
        const enable = andValues([pins[6], logicGate("not", pins[4], 0), logicGate("not", pins[5], 0)]);
        decode(pins, [1, 2, 3], enable, model.outputs, outputs);
    } else if (model.kind === "dual-decoder") {
        decode(pins, [2, 3], logicGate("not", pins[1], 0), [4, 5, 6, 7], outputs);
        decode(pins, [14, 13], logicGate("not", pins[15], 0), [12, 11, 10, 9], outputs);
    } else if (model.kind === "mux8") {
        outputs[5] = multiplex(pins, [11, 10, 9], [4, 3, 2, 1, 15, 14, 13, 12], logicGate("not", pins[7], 0));
        outputs[6] = logicGate("not", outputs[5], 0);
    } else if (model.kind === "dual-mux") {
        outputs[7] = multiplex(pins, [14, 2], [6, 5, 4, 3], logicGate("not", pins[1], 0));
        outputs[9] = multiplex(pins, [14, 2], [10, 11, 12, 13], logicGate("not", pins[15], 0));
    } else if (model.kind === "comparator") {
        compare(pins, outputs);
    } else if (model.kind === "seven-segment") {
        sevenSegment(pins, outputs);
    }
    return outputs;
}
