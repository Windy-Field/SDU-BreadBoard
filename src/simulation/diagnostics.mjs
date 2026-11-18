import { CHIP_MODELS } from "../chips/chips.mjs";
import { CHIP_REFERENCES } from "../chips/catalog.mjs";
import { pinHole, endpointLabel } from "../board/board.mjs";
import { nodeFor, readEndpoint } from "./engine.mjs";

// 把芯片脚号与真实孔位一起写出，方便从诊断定位接线
function pinDescription(chip, pin) {
    return "第 " + pin + " 脚 " + CHIP_MODELS[chip.model].labels[pin] + "（" + endpointLabel(pinHole(chip, pin)) + "）";
}

// 为问题增加受影响的芯片编号，同一诊断编号只保留一条
function addIssue(report, code, severity, message, chipId) {
    for (const issue of report.issues) {
        if (issue.code === code) {
            return;
        }
    }
    report.issues.push({ code: code, severity: severity, message: message, chipId: chipId });
}

// 检查时钟是否为确定电平，不把保持低电平或高电平误判为缺少时钟
function inspectClock(chip, pin, result, report) {
    const value = readEndpoint(result, pinHole(chip, pin));
    if (value !== 0 && value !== 1) {
        addIssue(report, "clock:" + chip.id + ":" + pin, "warning", chip.id + " 时钟不确定：" + pinDescription(chip, pin) + " 为 " + value + "，请检查时钟接线和驱动冲突", chip.id);
    }
}

// 检查寄存器输出是否已有确定数据，未知上电状态需要清零或有效采样
function inspectStoredState(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    const unknown = [];
    for (const pin of model.outputs) {
        if (readEndpoint(result, pinHole(chip, pin)) === "X") {
            unknown.push(String(pin));
        }
    }
    if (unknown.length > 0) {
        addIssue(report, "state:" + chip.id, "warning", chip.id + " 保存值尚不确定，输出脚 " + unknown.join("、") + " 为 X，请先清零、置数或提供满足控制条件的有效时钟边沿", chip.id);
    }
}

// 按触发器的通道顺序说明置位、复位或等待的时钟边沿
function inspectFlipFlops(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    const details = [];
    let active = 0;
    if (model.activeHigh) {
        active = 1;
    }
    let edge = "上升沿";
    if (model.edge === "falling") {
        edge = "下降沿";
    }
    for (let index = 0; index < model.channels.length; index = index + 1) {
        const channel = model.channels[index];
        const reset = readEndpoint(result, pinHole(chip, channel.reset));
        const set = readEndpoint(result, pinHole(chip, channel.set));
        const prefix = "第 " + (index + 1) + " 路";
        if (reset === active && set === active) {
            details.push(prefix + "置位和复位同时有效");
        } else if (reset === active) {
            details.push(prefix + "异步复位有效");
        } else if (set === active) {
            details.push(prefix + "异步置位有效");
        } else {
            inspectClock(chip, channel.clock, result, report);
            details.push(prefix + "等待" + edge + "采样");
        }
    }
    return details.join("；");
}

// 根据装载和两路使能说明计数器将在下一个有效边沿做什么
function describeCounter(chip, controls, result) {
    const load = readEndpoint(result, pinHole(chip, controls.load));
    if (load === 0) {
        return "等待上升沿并行置数";
    }
    const first = readEndpoint(result, pinHole(chip, controls.enable[0]));
    const second = readEndpoint(result, pinHole(chip, controls.enable[1]));
    if (load === 1 && (first === 0 || second === 0)) {
        return "计数禁止，保持原值";
    }
    if (load === 1 && first === 1 && second === 1) {
        return "等待上升沿计数";
    }
    return "置数或计数使能尚不确定";
}

// 读取移位寄存器的两路模式脚，区分保持、有效操作和未知组合
function describeShift(chip, controls, result) {
    const first = readEndpoint(result, pinHole(chip, controls.mode[0]));
    const second = readEndpoint(result, pinHole(chip, controls.mode[1]));
    if (first === 0 && second === 0) {
        return "保持模式，不进行移位";
    }
    const firstKnown = first === 0 || first === 1;
    const secondKnown = second === 0 || second === 1;
    if (!firstKnown || !secondKnown) {
        return "移位模式尚不确定";
    }
    return "等待上升沿移位或并行置数";
}

// 检查共用时钟与清零脚的器件，优先说明异步清零状态
function inspectClockedChip(chip, model, result, report) {
    const controls = model.controls;
    const reset = readEndpoint(result, pinHole(chip, controls.reset));
    if (reset === 0) {
        return "异步清零有效，输出保持为 0";
    }
    inspectClock(chip, controls.clock, result, report);
    if (model.sequential === "counter") {
        return describeCounter(chip, controls, result);
    }
    if (model.sequential === "shift") {
        return describeShift(chip, controls, result);
    }
    return "等待上升沿保存数据";
}

// 先说明各控制端的作用，再检查寄存器是否已经获得确定输出
function inspectTiming(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    let detail;
    if (model.channels) {
        detail = inspectFlipFlops(chip, result, report);
    } else {
        detail = inspectClockedChip(chip, model, result, report);
    }
    inspectStoredState(chip, result, report);
    return detail;
}

// 说明 RAM 的读写模式，数据脚只在写入时按输入检查
function inspectMemory(chip, result, report) {
    const specification = CHIP_MODELS[chip.model].memory;
    const selected = readEndpoint(result, pinHole(chip, specification.select));
    const writing = readEndpoint(result, pinHole(chip, specification.write));
    const reading = readEndpoint(result, pinHole(chip, specification.read));
    if (selected === 1) {
        return "片选无效，数据输出为高阻";
    }
    if (selected !== 0) {
        return "片选电平尚不确定";
    }
    if (writing === 0) {
        return "写入有效，请先结束写入再断开数据缓冲器";
    }
    if (writing !== 1) {
        return "写控制尚不确定，存储内容可能被改写";
    }
    if (reading === 1) {
        return "读写均禁止，保持内容并退出数据总线";
    }
    if (reading !== 0) {
        return "读控制尚不确定";
    }
    for (const pin of specification.data) {
        if (readEndpoint(result, pinHole(chip, pin)) === "X") {
            addIssue(report, "memory-state:" + chip.id, "warning", chip.id + " 读出数据为 X，请检查该地址是否已写入、地址控制与总线冲突", chip.id);
            break;
        }
    }
    return "读取有效，由 RAM 驱动数据总线";
}

// 根据连通关系找出某个问题影响的芯片，不依赖当前输出恰好为高或低
function issueAffectsChip(issue, chip, result) {
    if (issue.chipId === chip.id || issue.code.endsWith(":" + chip.id) || issue.code.startsWith("async-conflict:" + chip.id + ":")) {
        return true;
    }
    if (issue.code === "power-short" || issue.code === "unstable") {
        return true;
    }
    if (issue.code.startsWith("drivers:")) {
        const node = issue.code.slice("drivers:".length);
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            if (nodeFor(result.topology, pinHole(chip, pin)) === node) {
                return true;
            }
        }
    }
    return false;
}

// 检查硬接到电源轨的推挽输出，即使当前电平相同也存在驱动风险
function inspectOutputRails(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    for (const pin of model.outputs) {
        if (model.kind === "open-collector" || model.kind === "seven-segment") {
            continue;
        }
        if (model.memory) {
            const selected = readEndpoint(result, pinHole(chip, model.memory.select));
            const writing = readEndpoint(result, pinHole(chip, model.memory.write));
            const reading = readEndpoint(result, pinHole(chip, model.memory.read));
            if (selected === 1 || writing === 0 || reading === 1) {
                continue;
            }
        }
        const endpoint = pinHole(chip, pin);
        const node = nodeFor(result.topology, endpoint);
        for (const rail of ["VCC", "GND"]) {
            if (node === nodeFor(result.topology, rail)) {
                addIssue(report, "output-rail:" + chip.id + ":" + pin, "error", chip.id + " 输出直接接到 " + rail + "：" + pinDescription(chip, pin) + "，请检查是否误接电源轨", chip.id);
            }
        }
    }
}

// 检查当前参与工作的输入，只在明确写入时检查 RAM 的双向数据脚
function inspectUnknownInputs(chip, model, result, report) {
    const uncertain = [];
    for (const pin of model.inputs) {
        if (model.memory && model.bidirectional.includes(pin)) {
            const selected = readEndpoint(result, pinHole(chip, model.memory.select));
            const writing = readEndpoint(result, pinHole(chip, model.memory.write));
            if (selected !== 0 || writing !== 0) {
                continue;
            }
        }
        if (readEndpoint(result, pinHole(chip, pin)) === "X") {
            uncertain.push(String(pin));
        }
    }
    if (uncertain.length > 0) {
        const pins = uncertain.join("、");
        const message = chip.id + " 输入脚 " + pins + " 为 X，请检查上游输出、初始化状态或电平冲突";
        addIssue(report, "input-unknown:" + chip.id, "warning", message, chip.id);
    }
}

// 开集电极输出释放后仍为高阻时，提示检查是否缺少上拉
function inspectCollectorOutputs(chip, model, result, report) {
    if (model.kind !== "open-collector") {
        return;
    }
    for (const pin of model.outputs) {
        if (readEndpoint(result, pinHole(chip, pin)) === "Z") {
            const description = pinDescription(chip, pin);
            const message = chip.id + " OC 输出无上拉：" + description + "，释放时为 Z，可连接上拉电阻";
            addIssue(report, "oc-floating:" + chip.id + ":" + pin, "warning", message, chip.id);
        }
    }
}

// 已正常供电时检查引脚并返回芯片当前的工作模式说明
function inspectPoweredChip(chip, model, result, report) {
    inspectOutputRails(chip, result, report);
    inspectUnknownInputs(chip, model, result, report);
    let detail = "组合逻辑按当前输入计算";
    if (model.memory) {
        detail = inspectMemory(chip, result, report);
    } else if (chip.model === "74LS273" || model.sequential) {
        detail = inspectTiming(chip, result, report);
    }
    inspectCollectorOutputs(chip, model, result, report);
    return detail;
}

// 汇总可能影响这片芯片的问题，错误优先于警告
function applyChipSeverity(summary, chip, result, issues) {
    for (const issue of issues) {
        if (!issueAffectsChip(issue, chip, result)) {
            continue;
        }
        if (issue.severity === "error") {
            summary.severity = "error";
            summary.status = "存在工作异常";
            return;
        }
        if (summary.severity !== "error") {
            summary.severity = "warning";
            summary.status = "需要检查";
        }
    }
}

// 汇总一片芯片的供电、工作模式及封装资料提示
function inspectChip(chip, result, report) {
    const summary = {
        id: chip.id, model: chip.model, status: "未上电", severity: "info",
        detail: "电源已关闭，暂不进行工作状态判断"
    };
    if (report.power) {
        const model = CHIP_MODELS[chip.model];
        const power = readEndpoint(result, pinHole(chip, model.power));
        const ground = readEndpoint(result, pinHole(chip, model.ground));
        const supply = pinDescription(chip, model.power) + "=" + power;
        const referenceGround = pinDescription(chip, model.ground) + "=" + ground;
        summary.detail = supply + "；" + referenceGround;
        if (power !== 1 || ground !== 0) {
            summary.status = "供电异常";
            summary.severity = "error";
            const message = chip.id + " 电源不正确：" + summary.detail + "，请检查电源脚和地脚的接线";
            addIssue(report, "power:" + chip.id, "error", message, chip.id);
        } else {
            summary.status = "当前条件正常";
            summary.severity = "success";
            const purpose = inspectPoweredChip(chip, model, result, report);
            summary.detail = summary.detail + "；" + purpose;
        }
        applyChipSeverity(summary, chip, result, report.issues);
    }
    const reference = CHIP_REFERENCES[chip.model];
    if (reference.pinWarning) {
        summary.detail = summary.detail + "；" + reference.pinWarning;
    }
    return summary;
}

// 生成通用诊断报告，只读当前仿真结果，不改变输入、不发时钟、不修改电路
export function inspectCircuit(project, result) {
    const report = { issues: [], chips: [], power: project.power, stable: result.stable };
    for (const issue of result.issues) {
        report.issues.push({ code: issue.code, severity: issue.severity, message: issue.message, chipId: "" });
    }
    // 静态短接不依赖通电，关电时也应提醒再上电前排查
    const power = nodeFor(result.topology, "VCC");
    const ground = nodeFor(result.topology, "GND");
    if (power === ground) {
        addIssue(report, "power-short", "error", "+5V 与 GND 被导线短接，请先断开短接再上电", "");
    }
    if (!result.stable) {
        addIssue(report, "unstable", "error", "电路未达到稳定状态，请检查组合逻辑反馈", "");
    }
    for (const chip of project.chips) {
        report.chips.push(inspectChip(chip, result, report));
    }
    return report;
}
