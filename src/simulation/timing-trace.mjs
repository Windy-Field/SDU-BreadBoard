import { CHIP_MODELS } from "../chips/chips.mjs";
import { IO_LIMIT, pinHole } from "../board/board.mjs";
import { readEndpoint } from "./engine.mjs";

// 可同时监测的信号数和一轮记录中的逻辑变化数
export const TRACE_LIMITS = { signals: 8, changes: 200 };
const BOARD_SIGNALS = ["P+", "P-"];
const DEFAULT_SIGNALS = [
    { label: "P-", endpoint: "P-", group: "脉冲" },
    { label: "K0", endpoint: "K0", group: "输入 K" },
    { label: "L0", endpoint: "L0", group: "输出 L" }
];

// 创建只存在于当前页面的波形记录，不放进实验存档
export function createTimingTrace() {
    return {
        signals: DEFAULT_SIGNALS.slice(),
        samples: [],
        recording: false,
        notice: "尚未记录",
        revision: 0
    };
}

// 返回板载端口和当前芯片引脚供信号菜单显示
export function availableTimingSignals(project) {
    const signals = [];
    for (const name of BOARD_SIGNALS) {
        signals.push({ label: name, endpoint: name, group: "脉冲" });
    }
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        signals.push({ label: "K" + bit, endpoint: "K" + bit, group: "输入 K" });
    }
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        signals.push({ label: "L" + bit, endpoint: "L" + bit, group: "输出 L" });
    }
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            if (model.labels[pin] === "NC" || pin === model.power || pin === model.ground) {
                continue;
            }
            let label = chip.id + " · " + pin + "脚";
            if (model.labels[pin] !== "") {
                label = label + " " + model.labels[pin];
            }
            signals.push({ label: label, endpoint: pinHole(chip, pin), group: chip.id + " · " + chip.model });
        }
    }
    return signals;
}

// 读取当前选择的所有信号，结果按真实引脚位置保存
function readTimingSnapshot(trace, result) {
    const values = {};
    for (const signal of trace.signals) {
        values[signal.endpoint] = readEndpoint(result, signal.endpoint);
    }
    return values;
}

// 加入一个信号，返回是否成功加入
export function addTimingSignal(trace, signal) {
    if (trace.recording || trace.signals.length >= TRACE_LIMITS.signals) {
        return false;
    }
    for (const current of trace.signals) {
        if (current.endpoint === signal.endpoint) {
            return false;
        }
    }
    trace.signals = trace.signals.concat(signal);
    clearTimingTrace(trace, "信号已更改，原记录已清除");
    return true;
}

// 移除一个信号，返回是否确实移除了监测项
export function removeTimingSignal(trace, endpoint) {
    if (trace.recording) {
        return false;
    }
    const kept = [];
    for (const signal of trace.signals) {
        if (signal.endpoint !== endpoint) {
            kept.push(signal);
        }
    }
    if (kept.length === trace.signals.length) {
        return false;
    }
    trace.signals = kept;
    clearTimingTrace(trace, "信号已更改，原记录已清除");
    return true;
}

// 接线或仿真状态重置后停止采样，只保留仍属于相同位置和型号的引脚
export function resetTimingCircuit(trace, project, notice) {
    const available = availableTimingSignals(project);
    const kept = [];
    for (const signal of trace.signals) {
        for (const candidate of available) {
            if (candidate.endpoint === signal.endpoint && candidate.label === signal.label && candidate.group === signal.group) {
                kept.push(signal);
                break;
            }
        }
    }
    trace.signals = kept;
    clearTimingTrace(trace, notice);
}

// 开始新的记录，并将当前输入作为零号基准
export function startTimingTrace(trace, result) {
    if (trace.recording || trace.signals.length === 0) {
        return false;
    }
    trace.samples = [];
    trace.recording = true;
    trace.notice = "正在记录";
    const values = readTimingSnapshot(trace, result);
    appendTimingSample(trace, values, "初始电平");
    return true;
}

// 停止继续收集样本，保留本轮曲线供检查
export function stopTimingTrace(trace) {
    trace.recording = false;
    trace.notice = "记录已停止";
    trace.revision = trace.revision + 1;
}

// 清除样本但保留监测项，有旧记录时才说明它为何被清除
export function clearTimingTrace(trace, notice = "尚未记录") {
    const hadSamples = trace.samples.length > 0;
    trace.recording = false;
    trace.samples = [];
    trace.notice = "尚未记录";
    if (hadSamples) {
        trace.notice = notice;
    }
    trace.revision = trace.revision + 1;
}

// 保存一个事件及所有监测信号的电平，供波形和对照表共用
function appendTimingSample(trace, values, action) {
    const sample = { values: values, action: action };
    trace.samples.push(sample);
    trace.revision = trace.revision + 1;
}

// 仿真结束后只记录监测信号的变化，保留未知和高阻电平
export function captureTimingTrace(trace, result, action) {
    if (!trace.recording || trace.samples.length === 0) {
        return;
    }
    const previous = trace.samples[trace.samples.length - 1];
    const currentValues = readTimingSnapshot(trace, result);
    let changed = false;
    for (const signal of trace.signals) {
        const previousValue = previous.values[signal.endpoint];
        const currentValue = currentValues[signal.endpoint];
        if (previousValue !== currentValue) {
            changed = true;
            break;
        }
    }
    if (!changed) {
        return;
    }
    appendTimingSample(trace, currentValues, action);
    if (trace.samples.length - 1 >= TRACE_LIMITS.changes) {
        trace.recording = false;
        trace.notice = "本轮记录已达到 " + TRACE_LIMITS.changes + " 次变化上限";
    }
}

// 返回两个确定电平之间的边沿，未知或高阻变化不标记成时钟边沿
export function timingEdge(previous, current) {
    if (previous === 0 && current === 1) {
        return "↑";
    }
    if (previous === 1 && current === 0) {
        return "↓";
    }
    return "";
}
