import { logicValue, readNumber } from "./chip-logic.mjs";

// 创建整片 RAM 的未知内容，参数为存储器规格，返回独立的易失状态
export function createMemory(specification) {
    const words = [];
    for (let address = 0; address < specification.words; address = address + 1) {
        const bits = [];
        for (let bit = 0; bit < specification.data.length; bit = bit + 1) {
            bits.push("X");
        }
        words.push(bits);
    }
    return { words: words, powered: false };
}

// 判断候选地址是否符合已知地址位，未知位允许取 0 或 1
function matchesAddress(specification, pins, address) {
    for (let bit = 0; bit < specification.address.length; bit = bit + 1) {
        const value = logicValue(pins[specification.address[bit]]);
        const expected = (address >> bit) & 1;
        if (value !== "X" && value !== expected) {
            return false;
        }
    }
    return true;
}

// 读取一个数据位，地址未知时仅保留所有可能单元共有的值
function readMemoryBit(specification, pins, state, bit) {
    const address = readNumber(pins, specification.address);
    if (address !== "X") {
        return state.words[address][bit];
    }
    let value;
    for (let candidate = 0; candidate < specification.words; candidate = candidate + 1) {
        if (matchesAddress(specification, pins, candidate)) {
            const stored = state.words[candidate][bit];
            if (value === undefined) {
                value = stored;
            } else if (value !== stored) {
                return "X";
            }
        }
    }
    return value;
}

// 根据片选与读写控制生成数据脚输出，未选中或写入时退出总线
export function memoryOutputs(specification, pins, state) {
    const outputs = {};
    const selected = pins[specification.select];
    const reading = pins[specification.read];
    const writing = pins[specification.write];
    for (let bit = 0; bit < specification.data.length; bit = bit + 1) {
        let value = "X";
        if (selected === 1 || reading === 1 || writing === 0) {
            value = "Z";
        } else if (selected === 0 && reading === 0 && writing === 1) {
            value = readMemoryBit(specification, pins, state, bit);
        }
        outputs[specification.data[bit]] = value;
    }
    return outputs;
}

// 写入一个候选单元，可能发生的写入只把无法确定的数据位改成 X
function writeMemoryWord(specification, pins, state, address, certain) {
    let changed = false;
    const word = state.words[address];
    for (let bit = 0; bit < specification.data.length; bit = bit + 1) {
        let value = logicValue(pins[specification.data[bit]]);
        if (!certain && word[bit] !== value) {
            value = "X";
        }
        if (word[bit] !== value) {
            word[bit] = value;
            changed = true;
        }
    }
    return changed;
}

// 在稳定电平上更新异步 RAM，断电丢失内容，写有效期间持续接受地址与数据
export function updateMemory(specification, pins, state, powered) {
    if (!powered) {
        if (state.powered) {
            const cleared = createMemory(specification);
            state.words = cleared.words;
        }
        state.powered = false;
        return false;
    }
    state.powered = true;
    const selected = pins[specification.select];
    const writing = pins[specification.write];
    if (selected === 1 || writing === 1) {
        return false;
    }
    const address = readNumber(pins, specification.address);
    const certain = selected === 0 && writing === 0 && address !== "X";
    if (certain) {
        return writeMemoryWord(specification, pins, state, address, true);
    }
    // 未知片选、写控制或地址可能误写多个单元，不能保留虚假的已知内容
    let changed = false;
    for (let candidate = 0; candidate < specification.words; candidate = candidate + 1) {
        if (matchesAddress(specification, pins, candidate)) {
            const updated = writeMemoryWord(specification, pins, state, candidate, false);
            changed = changed || updated;
        }
    }
    return changed;
}
