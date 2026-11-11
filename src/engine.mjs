import { CHIP_MODELS, evaluateAdder, logicGate } from "./chips.mjs";
import { baseNode, pinHole } from "./board.mjs";
import { evaluateExtra } from "./chip-logic.mjs";
import { createChipState, updateChipState, stateOutputs } from "./chip-state.mjs";

const MAX_SETTLE_PASSES = 96;
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
    let pullUp = false;
    for (const driver of drivers) {
        if (driver.kind === "pull-up") {
            pullUp = true;
            continue;
        }
        if (result === "Z") {
            result = driver.value;
        } else if (driver.value === "X" || driver.value !== result) {
            result = "X";
        }
    }
    if (result === "Z" && pullUp) {
        return 1;
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
    return { bits: bits, clock: "X", powered: false };
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

// 根据电源、按键、脉冲和芯片输出重建驱动表，返回各节点的驱动列表
function collectDrivers(project, topology, values, registers, pulses, devices, previousDrivers) {
    const drivers = {};
    if (project.power) {
        addDriver(drivers, nodeFor(topology, "VCC"), 1, "+5V");
        addDriver(drivers, nodeFor(topology, "GND"), 0, "GND");
        for (let index = 0; index < 24; index = index + 1) {
            const name = "K" + index;
            addDriver(drivers, nodeFor(topology, name), project.switches[index], name);
        }
        addDriver(drivers, nodeFor(topology, "P+"), pulses.positive, "P+");
        addDriver(drivers, nodeFor(topology, "P-"), pulses.negative, "P−");
        for (const endpoint of project.pullUps || []) {
            addDriver(drivers, nodeFor(topology, endpoint), 1, "上拉 " + endpoint, "pull-up");
        }
        for (const chip of project.chips) {
            const pins = readPins(chip, topology, values);
            const model = CHIP_MODELS[chip.model];
            // 双向脚的输入只读取外部驱动，避免把自己的 RBO 下拉当成永久灭灯输入
            if (model.bidirectional) {
                for (const pin of model.bidirectional) {
                    const node = nodeFor(topology, pinHole(chip, pin));
                    const external = [];
                    const source = chip.id + "-" + pin;
                    const entries = previousDrivers[node] || [];
                    for (const driver of entries) {
                        if (driver.source !== source) {
                            external.push(driver);
                        }
                    }
                    pins[pin] = resolveDrivers(external);
                }
            }
            const outputs = chipOutputs(chip, pins, registers, devices);
            for (const pin in outputs) {
                const hole = pinHole(chip, Number(pin));
                let kind = "push-pull";
                if (model.kind === "open-collector" || (model.bidirectional && model.bidirectional.includes(Number(pin)))) {
                    kind = "open-collector";
                }
                addDriver(drivers, nodeFor(topology, hole), outputs[pin], chip.id + "-" + pin, kind);
            }
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

// 等待组合逻辑逐级传播到稳定，返回节点电平和驱动表
function settle(project, topology, registers, pulses, devices) {
    let values = {};
    let drivers = {};
    for (let pass = 0; pass < MAX_SETTLE_PASSES; pass = pass + 1) {
        drivers = collectDrivers(project, topology, values, registers, pulses, devices, drivers);
        const next = driverValues(drivers);
        if (sameValues(values, next)) {
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
        const pins = readPins(chip, topology, values);
        const powered = project.power && chipPowered(chip, pins);
        const nextBits = [];
        for (let bit = 0; bit < 8; bit = bit + 1) {
            let value = register.bits[bit];
            if (!powered) {
                value = "X";
            } else if (pins[1] === 0) {
                value = 0;
            } else if (pins[1] !== 1) {
                value = "X";
            } else if (register.clock === 0 && pins[11] === 1) {
                value = pins[CHIP_MODELS[chip.model].data[bit]];
                if (value !== 0 && value !== 1) {
                    value = "X";
                }
            } else if ((register.clock === 0 && pins[11] !== 0) || (register.clock !== 1 && register.clock !== 0 && pins[11] !== 0)) {
                value = "X";
            }
            nextBits.push(value);
            if (value !== register.bits[bit]) {
                changed = true;
            }
        }
        register.bits = nextBits;
        register.clock = pins[11];
        register.powered = powered;
    }
    return changed;
}

// 根据稳定结果整理诊断，返回可显示的中文问题列表
function diagnose(project, result) {
    const issues = [];
    if (!project.power) {
        return issues;
    }
    if (nodeFor(result.topology, "VCC") === nodeFor(result.topology, "GND")) {
        issues.push({ code: "power-short", severity: "error", message: "+5V 与 GND 被导线短接，请断开对应连线" });
    }
    for (const node in result.drivers) {
        const drivers = [];
        let pushPull = 0;
        for (const driver of result.drivers[node]) {
            if (driver.kind !== "pull-up") {
                drivers.push(driver);
                if (driver.kind === "push-pull") {
                    pushPull = pushPull + 1;
                }
            }
        }
        if (drivers.length > 1 && pushPull > 0) {
            let sources = "";
            let high = false;
            let low = false;
            for (const driver of drivers) {
                if (sources !== "") {
                    sources = sources + "、";
                }
                sources = sources + driver.source;
                if (driver.value === 1) {
                    high = true;
                }
                if (driver.value === 0) {
                    low = true;
                }
            }
            let message = "多个推挽输出连接到同一节点：" + sources + "";
            if (high && low) {
                message = "高低电平冲突：" + sources + "，此节点结果为 X";
            }
            issues.push({ code: "drivers:" + node, severity: "error", message: message });
        }
    }
    for (const chip of project.chips) {
        const pins = readPins(chip, result.topology, result.values);
        if (!chipPowered(chip, pins)) {
            issues.push({ code: "power:" + chip.id, severity: "error", message: chip.id + " 电源不正确，请检查 VCC 和 GND" });
            continue;
        }
        const missing = [];
        for (const pin of CHIP_MODELS[chip.model].inputs) {
            if (pins[pin] === "Z") {
                missing.push(String(pin));
            }
        }
        if (missing.length > 0) {
            issues.push({ code: "floating:" + chip.id, severity: "warning", message: chip.id + " 输入悬空：第 " + missing.join("、") + " 脚" });
        }
    }
    if (!result.stable) {
        issues.push({ code: "unstable", severity: "error", message: "电路未达到稳定状态，请检查组合逻辑反馈" });
    }
    return issues;
}

// 创建仿真运行状态；保存文件不包含这部分易失状态
export function createRuntime() {
    return { registers: {}, devices: {}, pulses: { positive: 0, negative: 1 } };
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
    }
    let settled = settle(project, topology, runtime.registers, runtime.pulses, runtime.devices);
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
        }
        if (!changed) {
            complete = true;
            break;
        }
        settled = settle(project, topology, runtime.registers, runtime.pulses, runtime.devices);
    }
    const result = { topology: topology, values: settled.values, drivers: settled.drivers, stable: settled.stable && complete, issues: [] };
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
