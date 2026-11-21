import { CHIP_MODELS, evaluateAdder, logicGate } from "../chips/chips.mjs";
import { baseNode, pinHole, IO_LIMIT } from "../board/board.mjs";
import { evaluateExtra } from "../chips/chip-logic.mjs";
import { createChipState, updateChipState, stateOutputs } from "../chips/chip-state.mjs";
import { createMemory, memoryOutputs, updateMemory } from "../chips/chip-memory.mjs";
import { isWeakBoardInput } from "./board-signals.mjs";

// 单次组合逻辑传播的最大轮数，防止反馈振荡无限计算
const MAX_SETTLE_PASSES = 96;
// 单次时序更新的最大轮数，用于检测无法稳定的时序反馈
const MAX_SEQUENTIAL_PASSES = 12;

// 建立接线连通图，保存每个内部五孔组的根节点
export function buildTopology(project) {
    const parents = {};
    for (const wire of project.wires) {
        const first = baseNode(wire.from);
        const second = baseNode(wire.to);
        ensureNode(parents, first);
        ensureNode(parents, second);
        const firstRoot = findRoot(parents, first);
        const secondRoot = findRoot(parents, second);
        parents[secondRoot] = firstRoot;
    }
    return parents;
}

// 在连通图中登记一个节点，没有返回值
function ensureNode(parents, name) {
    if (!Object.hasOwn(parents, name)) {
        parents[name] = name;
    }
}

// 查找一个节点所属的连通组，返回组名
function findRoot(parents, name) {
    ensureNode(parents, name);
    let root = name;
    while (parents[root] !== root) {
        root = parents[root];
    }
    return root;
}

// 返回一个插孔所在的最终电气节点
export function nodeFor(topology, endpoint) {
    return findRoot(topology, baseNode(endpoint));
}

// 为节点增加一个驱动源，参数包含电平和来源名
function addDriver(drivers, node, value, source, kind = "push-pull") {
    if (value === "Z") {
        return;
    }
    if (!Object.hasOwn(drivers, node)) {
        drivers[node] = [];
    }
    drivers[node].push({ value: value, source: source, kind: kind });
}

// 解析一个节点的全部驱动，冲突或未知驱动返回 X，完全无驱动返回 Z
function resolveDrivers(drivers) {
    if (!drivers || drivers.length === 0) {
        return "Z";
    }
    let result = "Z";
    let weakValue = "Z";
    for (const driver of drivers) {
        // 多个弱源方向相反时电平不确定，但强驱动仍可决定电平
        if (driver.kind === "pull-up" || driver.kind === "weak-input") {
            if (weakValue === "Z") {
                weakValue = driver.value;
            } else if (weakValue !== driver.value) {
                weakValue = "X";
            }
            continue;
        }
        if (result === "Z") {
            result = driver.value;
        } else if (driver.value === "X" || driver.value !== result) {
            result = "X";
        }
    }
    if (result === "Z") {
        return weakValue;
    }
    return result;
}

// 从节点电平表中读取端点，未被驱动的孔返回 Z
export function readEndpoint(result, endpoint) {
    const node = nodeFor(result.topology, endpoint);
    if (!Object.hasOwn(result.values, node)) {
        return "Z";
    }
    return result.values[node];
}

// 读取芯片所有引脚的电平，返回以脚号索引的对象
function readPins(chip, topology, values) {
    const pins = {};
    const model = CHIP_MODELS[chip.model];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
        const hole = pinHole(chip, pin);
        const node = nodeFor(topology, hole);
        pins[pin] = "Z";
        if (Object.hasOwn(values, node)) {
            pins[pin] = values[node];
        }
    }
    return pins;
}

// 判断芯片是否得到正确的电源和地
function chipPowered(chip, pins) {
    const model = CHIP_MODELS[chip.model];
    return pins[model.power] === 1 && pins[model.ground] === 0;
}

// 为寄存器建立八位未知的初始状态，返回状态对象
function initialRegister() {
    const bits = [];
    for (let index = 0; index < 8; index = index + 1) {
        bits.push("X");
    }
    return { bits: bits, clock: "X" };
}

// 返回指定芯片应驱动的全部输出电平，未供电时不驱动输出
function chipOutputs(chip, pins, registers, devices) {
    const model = CHIP_MODELS[chip.model];
    const outputs = {};
    if (!chipPowered(chip, pins)) {
        return outputs;
    }
    if (chip.model === "74LS273") {
        const register = registers[chip.id];
        for (let bit = 0; bit < 8; bit = bit + 1) {
            outputs[model.outputs[bit]] = register.bits[bit];
        }
        return outputs;
    }
    if (chip.model === "74LS283") {
        return evaluateAdder(pins);
    }
    if (model.memory) {
        return memoryOutputs(model.memory, pins, devices[chip.id]);
    }
    if (model.sequential) {
        return stateOutputs(model, pins, devices[chip.id]);
    }
    if (model.kind) {
        return evaluateExtra(model, pins);
    }
    for (const gate of model.gates) {
        outputs[gate[2]] = logicGate(model.operation, pins[gate[0]], pins[gate[1]]);
    }
    return outputs;
}

// 登记板载电源、开关、脉冲和外接上拉，不依赖上一轮的芯片输出
function addBoardDrivers(project, topology, runtime, drivers) {
    addDriver(drivers, nodeFor(topology, "VCC"), 1, "+5V");
    addDriver(drivers, nodeFor(topology, "GND"), 0, "GND");
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        const name = "K" + index;
        const node = nodeFor(topology, name);
        if (isWeakBoardInput(project, runtime.triState, index)) {
            addDriver(drivers, node, project.switches[index], name + "（弱驱动）", "weak-input");
        } else {
            addDriver(drivers, node, project.switches[index], name);
        }
    }
    addDriver(drivers, nodeFor(topology, "P+"), runtime.pulses.positive, "P+");
    addDriver(drivers, nodeFor(topology, "P-"), runtime.pulses.negative, "P−");
    if (project.pullUps) {
        for (const endpoint of project.pullUps) {
            addDriver(drivers, nodeFor(topology, endpoint), 1, "上拉 " + endpoint, "pull-up");
        }
    }
}

// 双向脚用上一轮的外部驱动读值，排除引脚自己驱动的输出
function readBidirectionalPins(chip, pins, topology, drivers, previousDrivers) {
    const model = CHIP_MODELS[chip.model];
    if (!model.bidirectional || !chipPowered(chip, pins)) {
        return;
    }
    for (const pin of model.bidirectional) {
        const node = nodeFor(topology, pinHole(chip, pin));
        const external = [];
        const source = chip.id + "-" + pin;
        const entries = previousDrivers[node];
        if (entries) {
            for (const driver of entries) {
                if (driver.source !== source) {
                    external.push(driver);
                }
            }
        }
        // 74LS48 的 BI/RBO 内置弱上拉，而 RAM 数据脚没有
        if (model.kind === "seven-segment") {
            addDriver(drivers, node, 1, source + "-bias", "pull-up");
            external.push({ value: 1, kind: "pull-up" });
        }
        pins[pin] = resolveDrivers(external);
    }
}

// 区分普通推挽、开集电极和 74LS48 段输出使用的内部弱上拉
function outputDriverKind(model, pin, value) {
    if (model.kind === "open-collector") {
        return "open-collector";
    }
    if (model.kind === "seven-segment") {
        if (pin !== model.controls.blanking && value === 1) {
            return "pull-up";
        }
        return "open-collector";
    }
    return "push-pull";
}

// 读取上一轮电平并重建驱动表，断电时不登记任何驱动
function collectDrivers(project, topology, values, runtime, previousDrivers) {
    const drivers = {};
    if (!project.power) {
        return drivers;
    }
    addBoardDrivers(project, topology, runtime, drivers);
    for (const chip of project.chips) {
        const pins = readPins(chip, topology, values);
        readBidirectionalPins(chip, pins, topology, drivers, previousDrivers);
        const outputs = chipOutputs(chip, pins, runtime.registers, runtime.devices);
        const model = CHIP_MODELS[chip.model];
        for (const pin in outputs) {
            const pinNumber = Number(pin);
            const hole = pinHole(chip, pinNumber);
            const kind = outputDriverKind(model, pinNumber, outputs[pin]);
            addDriver(drivers, nodeFor(topology, hole), outputs[pin], chip.id + "-" + pin, kind);
        }
    }
    return drivers;
}

// 把驱动表转换为节点电平，返回新的电平对象
function driverValues(drivers) {
    const values = {};
    for (const name in drivers) {
        values[name] = resolveDrivers(drivers[name]);
    }
    return values;
}

// 比较前后两轮节点电平是否相同
function sameValues(first, second) {
    const names = Object.keys(first);
    if (names.length !== Object.keys(second).length) {
        return false;
    }
    for (const name of names) {
        if (first[name] !== second[name]) {
            return false;
        }
    }
    return true;
}

// 记录会改变网络连通性的接线和芯片位置，不受走线路径、颜色或名称影响
function topologySignature(project) {
    const connections = [];
    for (const wire of project.wires) {
        connections.push([wire.from, wire.to]);
    }
    const chips = [];
    for (const chip of project.chips) {
        chips.push([chip.id, chip.model, chip.section, chip.column]);
    }
    return JSON.stringify([connections, chips, project.pullUps]);
}

// 从上次稳定的电平开始传播，让刚释放控制端的反馈锁存器保留状态
function settle(project, topology, runtime, previous) {
    let values = {};
    let drivers = {};
    if (previous && previous.stable) {
        values = previous.values;
        drivers = previous.drivers;
    }
    for (let pass = 0; pass < MAX_SETTLE_PASSES; pass = pass + 1) {
        drivers = collectDrivers(project, topology, values, runtime, drivers);
        const next = driverValues(drivers);
        // 至少用本次算出的驱动表再传播一轮，双向脚需要用它分辨外部驱动
        if (pass > 0 && sameValues(values, next)) {
            return { values: next, drivers: drivers, stable: true };
        }
        values = next;
    }
    // 没有稳定的电路不能保留某一次迭代的假结果
    for (const name in values) {
        values[name] = "X";
    }
    return { values: values, drivers: drivers, stable: false };
}

// 在稳定数据上同时更新全部寄存器，低有效清零优先于时钟
function updateRegisters(project, topology, values, registers) {
    let changed = false;
    for (const chip of project.chips) {
        if (chip.model !== "74LS273") {
            continue;
        }
        const register = registers[chip.id];
        const model = CHIP_MODELS[chip.model];
        const pins = readPins(chip, topology, values);
        const powered = project.power && chipPowered(chip, pins);
        const reset = pins[model.controls.reset];
        const clock = pins[model.controls.clock];
        const rising = register.clock === 0 && clock === 1;
        const previousHigh = register.clock === 1;
        // 当前不是低电平且旧时钟不是高电平时，可能刚发生上升沿
        const uncertainRise = clock !== 0 && !previousHigh;
        const nextBits = [];
        for (let bit = 0; bit < model.data.length; bit = bit + 1) {
            let value = register.bits[bit];
            if (!powered) {
                value = "X";
            } else if (reset === 0) {
                value = 0;
            } else if (reset !== 1) {
                value = "X";
            } else if (rising) {
                value = pins[model.data[bit]];
                if (value !== 0 && value !== 1) {
                    value = "X";
                }
            } else if (uncertainRise) {
                value = "X";
            }
            nextBits.push(value);
            if (value !== register.bits[bit]) {
                changed = true;
            }
        }
        register.bits = nextBits;
        register.clock = clock;
    }
    return changed;
}

// 检查一个节点的强驱动，上拉和处于三态的板载开关不计入冲突
function describeDriverConflict(drivers) {
    const sources = [];
    let pushPull = false;
    let high = false;
    let low = false;
    for (const driver of drivers) {
        if (driver.kind === "pull-up" || driver.kind === "weak-input") {
            continue;
        }
        sources.push(driver.source);
        if (driver.kind === "push-pull") {
            pushPull = true;
        }
        if (driver.value === 1) {
            high = true;
        } else if (driver.value === 0) {
            low = true;
        }
    }
    if (sources.length < 2 || !pushPull) {
        return "";
    }
    const names = sources.join("、");
    if (high && low) {
        return "高低电平冲突：" + names + "，此节点结果为 X";
    }
    return "多个驱动源连接到同一节点：" + names;
}

// 仅检查当前需要输入的引脚，返回悬空脚号供提示使用
function floatingInputs(model, pins) {
    const missing = [];
    for (const pin of model.inputs) {
        if (pins[pin] !== "Z") {
            continue;
        }
        // 七段译码器的 RBI 允许开路，开路时不请求灭零
        if (model.kind === "seven-segment" && pin === model.controls.rippleBlanking) {
            continue;
        }
        if (model.memory && model.bidirectional.includes(pin)) {
            const selected = pins[model.memory.select];
            const writing = pins[model.memory.write];
            if (selected !== 0 || writing !== 0) {
                continue;
            }
        }
        missing.push(String(pin));
    }
    return missing;
}

// 检查单片芯片的供电、悬空输入和置位复位冲突
function diagnoseChip(chip, result, issues) {
    const pins = readPins(chip, result.topology, result.values);
    if (!chipPowered(chip, pins)) {
        issues.push({ code: "power:" + chip.id, severity: "error", message: chip.id + " 电源不正确，请检查 VCC 和 GND" });
        return;
    }
    const model = CHIP_MODELS[chip.model];
    const missing = floatingInputs(model, pins);
    if (missing.length > 0) {
        const pinList = missing.join("、");
        issues.push({ code: "floating:" + chip.id, severity: "warning", message: chip.id + " 输入悬空：第 " + pinList + " 脚" });
    }
    if (!model.channels) {
        return;
    }
    let active = 0;
    if (model.activeHigh) {
        active = 1;
    }
    for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        if (pins[channel.set] === active && pins[channel.reset] === active) {
            const channelName = chip.id + " 第 " + (index + 1) + " 路";
            const message = channelName + "置位和复位同时有效，两个输出均为 1，同时释放后的状态不确定";
            issues.push({ code: "async-conflict:" + chip.id + ":" + index, severity: "warning", message: message });
        }
    }
}

// 汇总通电时的电源、节点和芯片问题，保持诊断显示顺序
function diagnose(project, result) {
    const issues = [];
    if (!project.power) {
        return issues;
    }
    const power = nodeFor(result.topology, "VCC");
    const ground = nodeFor(result.topology, "GND");
    if (power === ground) {
        issues.push({ code: "power-short", severity: "error", message: "+5V 与 GND 被导线短接，请断开对应连线" });
    }
    for (const node in result.drivers) {
        const message = describeDriverConflict(result.drivers[node]);
        if (message !== "") {
            issues.push({ code: "drivers:" + node, severity: "error", message: message });
        }
    }
    for (const chip of project.chips) {
        diagnoseChip(chip, result, issues);
    }
    if (!result.stable) {
        issues.push({ code: "unstable", severity: "error", message: "电路未达到稳定状态，请检查组合逻辑反馈" });
    }
    return issues;
}

// 创建仿真运行状态；保存文件不包含这部分易失状态
export function createRuntime() {
    return { registers: {}, devices: {}, pulses: { positive: 0, negative: 1 }, triState: false, feedback: null };
}

// 按实际接线计算整个电路，更新运行状态并返回端点电平和诊断
export function simulate(project, runtime) {
    const topology = buildTopology(project);
    for (const chip of project.chips) {
        if (chip.model === "74LS273" && !Object.hasOwn(runtime.registers, chip.id)) {
            runtime.registers[chip.id] = initialRegister();
        }
        const model = CHIP_MODELS[chip.model];
        if (model.sequential && !Object.hasOwn(runtime.devices, chip.id)) {
            runtime.devices[chip.id] = createChipState(model);
        }
        if (model.memory && !Object.hasOwn(runtime.devices, chip.id)) {
            runtime.devices[chip.id] = createMemory(model.memory);
        }
    }
    const signature = topologySignature(project);
    let previous = null;
    if (project.power && runtime.feedback && runtime.feedback.signature === signature) {
        previous = runtime.feedback.settled;
    }
    let settled = settle(project, topology, runtime, previous);
    let complete = false;
    for (let pass = 0; pass < MAX_SEQUENTIAL_PASSES; pass = pass + 1) {
        let changed = updateRegisters(project, topology, settled.values, runtime.registers);
        for (const chip of project.chips) {
            const model = CHIP_MODELS[chip.model];
            if (model.sequential) {
                const pins = readPins(chip, topology, settled.values);
                const updated = updateChipState(model, pins, runtime.devices[chip.id], project.power && chipPowered(chip, pins));
                changed = changed || updated;
            }
            if (model.memory) {
                const pins = readPins(chip, topology, settled.values);
                const powered = project.power && chipPowered(chip, pins);
                const updated = updateMemory(model.memory, pins, runtime.devices[chip.id], powered);
                changed = changed || updated;
            }
        }
        if (!changed) {
            complete = true;
            break;
        }
        settled = settle(project, topology, runtime, settled);
    }
    const result = { signature: signature, topology: topology, values: settled.values, drivers: settled.drivers, stable: settled.stable && complete, issues: [] };
    runtime.feedback = null;
    if (project.power && result.stable) {
        runtime.feedback = { signature: signature, settled: settled };
    }
    result.issues = diagnose(project, result);
    return result;
}

// 输出一次完整手动脉冲，起始、有效和恢复三个状态都参与仿真
export function emitPulse(project, runtime, kind) {
    runtime.pulses.positive = 0;
    runtime.pulses.negative = 1;
    simulate(project, runtime);
    if (kind === "P+") {
        runtime.pulses.positive = 1;
    } else {
        runtime.pulses.negative = 0;
    }
    simulate(project, runtime);
    runtime.pulses.positive = 0;
    runtime.pulses.negative = 1;
    return simulate(project, runtime);
}
