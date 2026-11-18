import { element, icon, node, refreshIcons, svgElement } from "./dom.mjs";
import { encodeTimingTrace } from "./timing-export.mjs";
import { bindFileExport } from "./export-dialog.mjs";
import {
    TRACE_LIMITS, addTimingSignal, availableTimingSignals, clearTimingTrace,
    removeTimingSignal, startTimingTrace, stopTimingTrace, timingEdge
} from "../simulation/timing-trace.mjs";

// 图面坐标使用 CSS 像素，事件按钮与每段波形共用同一个列宽
const WAVE = { step: 44, height: 32, high: 8, low: 24, middle: 16, scaleWidth: 20, tickLength: 6, valueOffset: 16, valueHeight: 13 };
let available = [];
let renderedTrace = null;
let renderedRevision = -1;
let renderedSignature = null;
let renderedSignals = null;
let selectedEvent = -1;
let followLatest = true;

// 返回当前已加入的孔位，供信号菜单隐藏重复选项
function watchedEndpoints(trace) {
    const endpoints = new Set();
    for (const signal of trace.signals) {
        endpoints.add(signal.endpoint);
    }
    return endpoints;
}

// 按板载端口和芯片分组刷新信号选项，能保留尚未添加的选项
function renderSignalPicker(trace) {
    const picker = element("timing-signal");
    const previous = picker.value;
    const groups = new Map();
    const watched = watchedEndpoints(trace);
    picker.replaceChildren();
    for (const signal of available) {
        if (watched.has(signal.endpoint)) {
            continue;
        }
        let group = groups.get(signal.group);
        if (!group) {
            group = document.createElement("optgroup");
            group.label = signal.group;
            groups.set(signal.group, group);
            picker.append(group);
        }
        const option = node("option", signal.label, "");
        option.value = signal.endpoint;
        option.selected = signal.endpoint === previous;
        group.append(option);
    }
}

// 显示监测信号及移除按钮，记录时暂时锁定信号组
function renderSignals(trace) {
    const list = element("timing-signals");
    list.replaceChildren();
    for (const signal of trace.signals) {
        const item = node("li", "", "");
        const button = node("button", "", "icon-button");
        const label = "移除 " + signal.label;
        button.type = "button";
        button.dataset.endpoint = signal.endpoint;
        button.setAttribute("aria-label", label);
        button.title = label;
        button.append(icon("x"));
        item.append(node("span", signal.label, ""), button);
        list.append(item);
    }
    element("timing-signal-count").textContent = trace.signals.length + " / " + TRACE_LIMITS.signals;
    refreshIcons();
}

// 给已知电平使用高低轨道，X 和 Z 使用中间轨道
function waveHeight(value) {
    if (value === 1) {
        return WAVE.high;
    }
    if (value === 0) {
        return WAVE.low;
    }
    return WAVE.middle;
}

// 在固定列放置信号名称和电平刻度，刻度与波形共用高低坐标
function drawLaneLabel(row, signal) {
    const column = node("div", "", "timing-lane-label timing-lane-heading");
    const label = node("span", signal.label, "timing-lane-name");
    label.title = signal.label;
    column.append(label);
    row.append(column);
    const scale = svgElement(column, "svg", { width: WAVE.scaleWidth, height: WAVE.height, class: "timing-level-scale" });
    const tickStart = WAVE.scaleWidth - WAVE.tickLength;
    const textCenter = tickStart / 2;
    for (const level of [1, 0]) {
        const height = waveHeight(level);
        svgElement(scale, "text", { x: textCenter, y: height, "dominant-baseline": "central", "text-anchor": "middle" }, String(level));
        svgElement(scale, "line", { x1: tickStart, y1: height, x2: WAVE.scaleWidth, y2: height });
    }
}

// 为一条信号绘制波形行，横向滚动不会移走左侧的刻度
function drawSignalLane(container, trace, signal) {
    const row = node("div", "", "timing-lane");
    drawLaneLabel(row, signal);
    container.append(row);
    const width = trace.samples.length * WAVE.step;
    const svg = svgElement(row, "svg", { width: width, height: WAVE.height });
    svgElement(svg, "rect", { width: WAVE.step, height: WAVE.height, class: "timing-wave-selected" });
    // 将相同线型合成一条路径，长记录不必为每段电平创建线条节点
    const paths = { grid: "", digital: "", X: "", Z: "" };
    let previous = null;
    for (let index = 0; index < trace.samples.length; index = index + 1) {
        const position = index * WAVE.step;
        const value = trace.samples[index].values[signal.endpoint];
        const height = waveHeight(value);
        if (index > 0) {
            paths.grid = paths.grid + "M" + position + " 0V" + WAVE.height;
        }
        const segment = "M" + position + " " + height + "h" + WAVE.step;
        if (value === "X" || value === "Z") {
            paths[value] = paths[value] + segment;
            const valuePosition = position + WAVE.valueOffset;
            svgElement(svg, "text", { x: valuePosition, y: WAVE.valueHeight, class: "timing-wave-value" }, value);
        } else {
            paths.digital = paths.digital + segment;
            // 只有高低电平互换才画垂直边沿，未知和高阻另用线型表示
            if (timingEdge(previous, value) !== "") {
                paths.digital = paths.digital + "M" + position + " " + waveHeight(previous) + "V" + height;
            }
        }
        previous = value;
    }
    svgElement(svg, "path", { d: paths.grid, class: "timing-wave-grid" });
    svgElement(svg, "path", { d: paths.digital, class: "timing-wave-line" });
    svgElement(svg, "path", { d: paths.X, class: "timing-wave-line timing-wave-x" });
    svgElement(svg, "path", { d: paths.Z, class: "timing-wave-line timing-wave-z" });
}

// 生成简短的边沿刻度，有不同方向时同时显示上升和下降
function eventMark(trace, index) {
    if (index === 0) {
        return "";
    }
    const before = trace.samples[index - 1].values;
    const after = trace.samples[index].values;
    let rising = "";
    let falling = "";
    for (const signal of trace.signals) {
        const edge = timingEdge(before[signal.endpoint], after[signal.endpoint]);
        if (edge === "↑") {
            rising = edge;
        } else if (edge === "↓") {
            falling = edge;
        }
    }
    return rising + falling;
}

// 标出选中的事件列并同步变化前后的电平表
function showEvent(trace) {
    const detail = element("timing-detail");
    const sample = trace.samples[selectedEvent];
    detail.hidden = !sample;
    if (!sample) {
        return;
    }
    const offset = selectedEvent * WAVE.step;
    for (const mark of element("timing-lanes").querySelectorAll(".timing-wave-selected")) {
        mark.setAttribute("x", String(offset));
    }
    for (const button of element("timing-events").querySelectorAll("button")) {
        const active = Number(button.dataset.event) === selectedEvent;
        button.setAttribute("aria-pressed", String(active));
        button.tabIndex = -1;
        if (active) {
            button.tabIndex = 0;
        }
    }
    element("timing-event-title").textContent = "#" + selectedEvent + " · " + sample.action;
    const values = element("timing-values");
    values.replaceChildren();
    for (const signal of trace.signals) {
        const after = sample.values[signal.endpoint];
        let before = "—";
        if (selectedEvent > 0) {
            before = trace.samples[selectedEvent - 1].values[signal.endpoint];
        }
        const row = document.createElement("tr");
        const name = node("th", signal.label, "");
        name.scope = "row";
        let edge = timingEdge(before, after);
        if (edge === "") {
            edge = "—";
        }
        row.append(name, node("td", String(before), ""), node("td", String(after), ""), node("td", edge, ""));
        if (selectedEvent > 0 && before !== after) {
            row.classList.add("timing-value-changed");
        }
        values.append(row);
    }
}

// 根据事件序号刷新波形，尺寸不受选中事件和数值字符影响
function renderWave(trace) {
    const chart = element("timing-chart");
    const lanes = element("timing-lanes");
    const events = element("timing-events");
    const focused = events.contains(document.activeElement);
    const count = trace.samples.length;
    element("timing-empty").hidden = count > 0;
    lanes.replaceChildren();
    events.replaceChildren();
    if (count === 0) {
        selectedEvent = -1;
        followLatest = true;
        showEvent(trace);
        return;
    }
    for (const signal of trace.signals) {
        drawSignalLane(lanes, trace, signal);
    }
    events.append(node("span", "序号", "timing-lane-label"));
    for (let index = 0; index < count; index = index + 1) {
        const label = eventMark(trace, index);
        const button = node("button", index + label, "timing-event");
        button.type = "button";
        button.dataset.event = String(index);
        const description = "事件 " + index + "：" + trace.samples[index].action;
        button.title = description;
        button.setAttribute("aria-label", description);
        events.append(button);
    }
    if (followLatest || selectedEvent < 0 || selectedEvent >= count) {
        selectedEvent = count - 1;
        chart.scrollLeft = chart.scrollWidth;
    }
    showEvent(trace);
    if (focused) {
        const selected = events.querySelector("[tabindex='0']");
        selected.focus({ preventScroll: true });
    }
}

// 只有电路、监测配置或样本变化时才重画可见面板
export function renderTimingPanel(state) {
    const trace = state.timing;
    const signature = state.result.signature;
    const circuitChanged = trace !== renderedTrace || signature !== renderedSignature;
    if (circuitChanged) {
        available = availableTimingSignals(state.project);
    }
    if (circuitChanged || trace.signals !== renderedSignals) {
        renderSignalPicker(trace);
        renderSignals(trace);
        renderedSignals = trace.signals;
    }
    if (!circuitChanged && trace.revision === renderedRevision) {
        return;
    }
    renderedTrace = trace;
    renderedSignature = signature;
    renderedRevision = trace.revision;
    const picker = element("timing-signal");
    picker.disabled = trace.recording || trace.signals.length >= TRACE_LIMITS.signals || picker.options.length === 0;
    element("timing-add").disabled = picker.disabled;
    element("timing-start").disabled = trace.recording || trace.signals.length === 0;
    const startLabel = element("timing-start-label");
    startLabel.textContent = "开始";
    if (!trace.recording && trace.samples.length > 0) {
        startLabel.textContent = "重新记录";
    }
    element("timing-stop").disabled = !trace.recording;
    element("timing-clear").disabled = trace.recording || trace.samples.length === 0;
    element("timing-export").disabled = trace.samples.length === 0;
    for (const button of element("timing-signals").querySelectorAll("button")) {
        button.disabled = trace.recording;
    }
    const status = element("timing-status");
    status.textContent = trace.notice;
    status.classList.toggle("timing-recording", trace.recording);
    renderWave(trace);
}

// 按菜单中的物理孔位添加监测项
function addSignal(state) {
    const picker = element("timing-signal");
    for (const signal of available) {
        if (signal.endpoint === picker.value && addTimingSignal(state.timing, signal)) {
            renderTimingPanel(state);
            return;
        }
    }
}

// 依据按钮所指的孔位移除信号，并将焦点交回信号菜单
function removeSignal(state, event) {
    const button = event.target.closest("button[data-endpoint]");
    if (button && removeTimingSignal(state.timing, button.dataset.endpoint)) {
        renderTimingPanel(state);
        element("timing-signal").focus();
    }
}

// 开始新一轮记录，同时保存当前电平作为零号事件
function startRecording(state) {
    if (startTimingTrace(state.timing, state.result)) {
        followLatest = true;
        renderTimingPanel(state);
        element("timing-stop").focus();
    }
}

// 停止记录并保留已完成的波形
function stopRecording(state) {
    stopTimingTrace(state.timing);
    renderTimingPanel(state);
    element("timing-start").focus();
}

// 清空当前波形，仍可用原来选好的信号再录一次
function clearRecording(state) {
    clearTimingTrace(state.timing);
    renderTimingPanel(state);
    element("timing-start").focus();
}

// 导出选中的文件格式，录制期间也能保留截至点击时的整轮波形
function createTimingFile(state, format) {
    const lanes = element("timing-lanes");
    return encodeTimingTrace(lanes, state.timing, format);
}

// 点击波形或上方的事件刻度时选中对应事件
function clickWave(state, event) {
    const button = event.target.closest(".timing-event");
    const svg = event.target.closest(".timing-lane > svg");
    let index = -1;
    if (button) {
        index = Number(button.dataset.event);
    } else if (svg) {
        const bounds = svg.getBoundingClientRect();
        index = Math.floor((event.clientX - bounds.left) / WAVE.step);
    }
    if (index >= 0 && index < state.timing.samples.length) {
        followLatest = false;
        selectedEvent = index;
        showEvent(state.timing);
    }
}

// 用方向键在刻度间移动，Home 和 End 分别到首末事件
function moveEvent(state, event) {
    const button = event.target.closest(".timing-event");
    if (!button) {
        return;
    }
    const last = state.timing.samples.length - 1;
    let index = Number(button.dataset.event);
    if (event.key === "ArrowLeft") {
        index = Math.max(0, index - 1);
    } else if (event.key === "ArrowRight") {
        index = Math.min(last, index + 1);
    } else if (event.key === "Home") {
        index = 0;
    } else if (event.key === "End") {
        index = last;
    } else {
        return;
    }
    event.preventDefault();
    followLatest = false;
    selectedEvent = index;
    showEvent(state.timing);
    const selected = element("timing-events").querySelector("[tabindex='0']");
    selected.focus();
}

// 将时序面板的操作绑定到当前应用状态，切换实验后仍读取新记录
export function bindTimingPanel(state) {
    element("timing-panel").style.setProperty("--timing-step", WAVE.step + "px");
    element("timing-add").addEventListener("click", addSignal.bind(null, state));
    element("timing-signals").addEventListener("click", removeSignal.bind(null, state));
    element("timing-start").addEventListener("click", startRecording.bind(null, state));
    element("timing-stop").addEventListener("click", stopRecording.bind(null, state));
    element("timing-clear").addEventListener("click", clearRecording.bind(null, state));
    const createFile = createTimingFile.bind(null, state);
    bindFileExport("timing-export", "timing", createFile);
    element("timing-chart").addEventListener("click", clickWave.bind(null, state));
    element("timing-events").addEventListener("keydown", moveEvent.bind(null, state));
}
