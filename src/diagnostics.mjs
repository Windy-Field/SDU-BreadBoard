import { CHIP_MODELS } from "./chips.mjs";
import { CHIP_REFERENCES } from "./catalog.mjs";
import { pinHole, endpointLabel } from "./board.mjs";
import { nodeFor, readEndpoint } from "./engine.mjs";

// 时钟和控制脚属于芯片固定规格，不用输入名字猜测电平的有效极性
const REGISTER_CONTROLS = { clock: 11, reset: 1 };
const COUNTER_CONTROLS = { clock: 2, reset: 1, load: 9, enable: [7, 10] };
const SHIFT_CONTROLS = { clock: 2, reset: 1, mode: [9, 10] };

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

// 说明时序芯片当前控制状态，同时检查时钟与未知控制
function inspectTiming(chip, result, report) {
    const model = CHIP_MODELS[chip.model];
    const details = [];
    if (model.channels) {
        let active = 0;
        if (model.activeHigh) {
            active = 1;
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
                let edge = "上升沿";
                if (model.edge === "falling") {
                    edge = "下降沿";
                }
                details.push(prefix + "等待" + edge + "采样");
            }
        }
    } else {
        let controls = REGISTER_CONTROLS;
        if (model.sequential === "counter") {
            controls = COUNTER_CONTROLS;
        } else if (model.sequential === "shift") {
            controls = SHIFT_CONTROLS;
        }
        const reset = readEndpoint(result, pinHole(chip, controls.reset));
        if (reset === 0) {
            details.push("异步清零有效，输出保持为 0");
        } else {
            inspectClock(chip, controls.clock, result, report);
            if (model.sequential === "counter") {
                const load = readEndpoint(result, pinHole(chip, controls.load));
                const firstEnable = readEndpoint(result, pinHole(chip, controls.enable[0]));
                const secondEnable = readEndpoint(result, pinHole(chip, controls.enable[1]));
                if (load === 0) {
                    details.push("等待上升沿并行置数");
                } else if (load === 1 && (firstEnable === 0 || secondEnable === 0)) {
                    details.push("计数禁止，保持原值");
                } else {
                    if (load === 1 && firstEnable === 1 && secondEnable === 1) {
                        details.push("等待上升沿计数");
                    } else {
                        details.push("置数或计数使能尚不确定");
                    }
                }
            } else if (model.sequential === "shift") {
                const first = readEndpoint(result, pinHole(chip, controls.mode[0]));
                const second = readEndpoint(result, pinHole(chip, controls.mode[1]));
                if (first === 0 && second === 0) {
                    details.push("保持模式，不进行移位");
                } else if ((first !== 0 && first !== 1) || (second !== 0 && second !== 1)) {
                    details.push("移位模式尚不确定");
                } else {
                    details.push("等待上升沿移位或并行置数");
                }
            } else {
                details.push("等待上升沿保存数据");
            }
        }
    }
    inspectStoredState(chip, result, report);
    return details.join("；");
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
        const endpoint = pinHole(chip, pin);
        const node = nodeFor(result.topology, endpoint);
        for (const rail of ["VCC", "GND"]) {
            if (node === nodeFor(result.topology, rail)) {
                addIssue(report, "output-rail:" + chip.id + ":" + pin, "error", chip.id + " 输出直接接到 " + rail + "：" + pinDescription(chip, pin) + "，请检查是否误接电源轨", chip.id);
            }
        }
    }
}

// 生成通用诊断报告，只读当前仿真结果，不改变输入、不发时钟、不修改电路
export function inspectCircuit(project, result) {
    const report = { issues: [], chips: [], power: project.power, stable: result.stable };
    for (const issue of result.issues) {
        report.issues.push({ code: issue.code, severity: issue.severity, message: issue.message, chipId: "" });
    }
    // 静态短接不依赖通电，关电时也应提醒再上电前排查
    if (nodeFor(result.topology, "VCC") === nodeFor(result.topology, "GND")) {
        addIssue(report, "power-short", "error", "+5V 与 GND 被导线短接，请先断开短接再上电", "");
    }
    if (!result.stable) {
        addIssue(report, "unstable", "error", "电路未达到稳定状态，请检查组合逻辑反馈", "");
    }
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        const power = readEndpoint(result, pinHole(chip, model.power));
        const ground = readEndpoint(result, pinHole(chip, model.ground));
        let detail = "电源已关闭，暂不进行工作状态判断";
        let status = "未上电";
        let severity = "info";
        if (project.power) {
            detail = pinDescription(chip, model.power) + "=" + power + "；" + pinDescription(chip, model.ground) + "=" + ground;
            if (power !== 1 || ground !== 0) {
                status = "供电异常";
                severity = "error";
                addIssue(report, "power:" + chip.id, "error", chip.id + " 电源不正确：" + detail + "，请检查电源脚和地脚的接线", chip.id);
            } else {
                status = "当前条件正常";
                severity = "success";
                inspectOutputRails(chip, result, report);
                const uncertain = [];
                for (const pin of model.inputs) {
                    if (readEndpoint(result, pinHole(chip, pin)) === "X") {
                        uncertain.push(String(pin));
                    }
                }
                if (uncertain.length > 0) {
                    addIssue(report, "input-unknown:" + chip.id, "warning", chip.id + " 输入脚 " + uncertain.join("、") + " 为 X，请检查上游输出、初始化状态或电平冲突", chip.id);
                }
                if (chip.model === "74LS273" || model.sequential) {
                    detail = detail + "；" + inspectTiming(chip, result, report);
                } else {
                    detail = detail + "；组合逻辑按当前输入计算";
                }
                if (model.kind === "open-collector") {
                    for (const pin of model.outputs) {
                        if (readEndpoint(result, pinHole(chip, pin)) === "Z") {
                            addIssue(report, "oc-floating:" + chip.id + ":" + pin, "warning", chip.id + " OC 输出无上拉：" + pinDescription(chip, pin) + "，释放时为 Z，可连接上拉电阻", chip.id);
                        }
                    }
                }
            }
            for (const issue of report.issues) {
                if (issueAffectsChip(issue, chip, result)) {
                    if (issue.severity === "error") {
                        severity = "error";
                        status = "存在工作异常";
                    } else if (severity !== "error") {
                        severity = "warning";
                        status = "需要检查";
                    }
                }
            }
        }
        const reference = CHIP_REFERENCES[chip.model];
        if (reference.pinWarning) {
            detail = detail + "；" + reference.pinWarning;
        }
        report.chips.push({ id: chip.id, model: chip.model, status: status, severity: severity, detail: detail });
    }
    return report;
}
