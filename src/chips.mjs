import { Vector3vl } from "../vendor/logic.mjs";

export const CHIP_MODELS = {
    "74LS273": {
        title: "八位寄存器",
        count: 20,
        power: 20,
        ground: 10,
        labels: ["", "CLR̅", "Q0", "D0", "D1", "Q1", "Q2", "D2", "D3", "Q3", "GND", "CLK", "Q4", "D4", "D5", "Q5", "Q6", "D6", "D7", "Q7", "VCC"],
        inputs: [1, 3, 4, 7, 8, 11, 13, 14, 17, 18],
        outputs: [2, 5, 6, 9, 12, 15, 16, 19],
        data: [3, 4, 7, 8, 13, 14, 17, 18]
    },
    "74LS283": {
        title: "四位全加器",
        count: 16,
        power: 16,
        ground: 8,
        labels: ["", "Σ2", "B2", "A2", "Σ1", "A1", "B1", "C0", "GND", "C4", "Σ4", "B4", "A4", "Σ3", "A3", "B3", "VCC"],
        inputs: [2, 3, 5, 6, 7, 11, 12, 14, 15],
        outputs: [4, 1, 13, 10, 9],
        first: [5, 3, 14, 12],
        second: [6, 2, 15, 11]
    },
    "74LS86": {
        title: "四路异或门",
        count: 14,
        power: 14,
        ground: 7,
        labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
        inputs: [1, 2, 4, 5, 9, 10, 12, 13],
        outputs: [3, 6, 8, 11],
        gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
        operation: "xor"
    },
    "74LS00": {
        title: "四路与非门",
        count: 14,
        power: 14,
        ground: 7,
        labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3B", "3A", "4Y", "4B", "4A", "VCC"],
        inputs: [1, 2, 4, 5, 9, 10, 12, 13],
        outputs: [3, 6, 8, 11],
        gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
        operation: "nand"
    },
    "74LS08": {
        title: "四路与门",
        count: 14,
        power: 14,
        ground: 7,
        labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
        inputs: [1, 2, 4, 5, 9, 10, 12, 13],
        outputs: [3, 6, 8, 11],
        gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
        operation: "and"
    },
    "74LS32": {
        title: "四路或门",
        count: 14,
        power: 14,
        ground: 7,
        labels: ["", "1A", "1B", "1Y", "2A", "2B", "2Y", "GND", "3Y", "3A", "3B", "4Y", "4A", "4B", "VCC"],
        inputs: [1, 2, 4, 5, 9, 10, 12, 13],
        outputs: [3, 6, 8, 11],
        gates: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]],
        operation: "or"
    },
    "74LS04": {
        title: "六路非门",
        count: 14,
        power: 14,
        ground: 7,
        labels: ["", "1A", "1Y", "2A", "2Y", "3A", "3Y", "GND", "4Y", "4A", "5Y", "5A", "6Y", "6A", "VCC"],
        inputs: [1, 3, 5, 9, 11, 13],
        outputs: [2, 4, 6, 8, 10, 12],
        gates: [[1, 1, 2], [3, 3, 4], [5, 5, 6], [9, 9, 8], [11, 11, 10], [13, 13, 12]],
        operation: "not"
    }
};

// 把界面中的 0、1、X 转换为逻辑库中的单比特向量，返回向量。
function toVector(value) {
    if (value === 0) {
        return Vector3vl.zero;
    }
    if (value === 1) {
        return Vector3vl.one;
    }
    return Vector3vl.x;
}

// 使用三值逻辑库计算门电路，参数为运算名和两个输入，返回 0、1 或 X。
export function logicGate(operation, first, second) {
    const left = toVector(first);
    const right = toVector(second);
    let result = Vector3vl.x;
    if (operation === "xor") {
        result = left.xor(right);
    } else if (operation === "and") {
        result = left.and(right);
    } else if (operation === "or") {
        result = left.or(right);
    } else if (operation === "nand") {
        result = left.nand(right);
    } else if (operation === "not") {
        result = left.not();
    }
    if (result.isHigh) {
        return 1;
    }
    if (result.isLow) {
        return 0;
    }
    return "X";
}

// 使用逐位全加器计算 74LS283；输入按真实脚号索引，返回输出脚的电平。
export function evaluateAdder(pins) {
    const model = CHIP_MODELS["74LS283"];
    const outputs = {};
    let carry = pins[7];
    for (let bit = 0; bit < 4; bit = bit + 1) {
        const first = pins[model.first[bit]];
        const second = pins[model.second[bit]];
        const different = logicGate("xor", first, second);
        const sum = logicGate("xor", different, carry);
        const firstCarry = logicGate("and", first, second);
        const secondCarry = logicGate("and", different, carry);
        carry = logicGate("or", firstCarry, secondCarry);
        outputs[model.outputs[bit]] = sum;
    }
    outputs[9] = carry;
    return outputs;
}
