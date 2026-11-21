import { endpointLabel, pinHole } from "../board/board.mjs";
import { CHIP_MODELS } from "../chips/chips.mjs";
import { nodeFor, readEndpoint } from "../simulation/engine.mjs";
import { icon, node } from "./dom.mjs";

// 电平文字与颜色一起显示，不能仅凭颜色区分悬空与冲突
const LEVELS = {
    "0": { label: "低电平", tone: "low" },
    "1": { label: "高电平", tone: "high" },
    X: { label: "未知或冲突", tone: "unknown" },
    Z: { label: "悬空", tone: "floating" }
};

// 创建对象面板的分区，title 是分区标题，返回可填入内容的节点
export function objectSection(title) {
    const section = node("section", "", "object-section");
    section.append(node("h3", title, "object-section-title"));
    return section;
}

// 创建可并排阅读的单条状态，返回包含标签和对应值的节点
export function objectFact(label, value) {
    const fact = node("div", "", "object-fact");
    fact.append(node("dt", label, ""), node("dd", value, ""));
    return fact;
}

// 创建带图标的对象操作按钮，action 是点击时执行的函数
export function objectAction(symbol, label, action) {
    const button = node("button", "", "button object-action");
    button.type = "button";
    button.append(icon(symbol), node("span", label, ""));
    button.addEventListener("click", action);
    return button;
}

// 用同一套标记展示网络电平或引脚电平，展开时还会显示文字说明
export function objectLevel(value, expanded = false) {
    const level = LEVELS[value];
    const badge = node("span", "", "object-level " + level.tone);
    badge.append(node("b", String(value), ""));
    if (expanded) {
        badge.append(node("span", " · " + level.label, ""));
    } else {
        badge.setAttribute("aria-label", String(value) + " " + level.label);
    }
    return badge;
}

// 创建有编号和可选副标题的网络条目，传入 onSelect 时可以跳转
function networkRow(name, detail, value, onSelect = null) {
    const row = node("li", "", "object-network-row");
    let label = node("span", "", "object-network-label");
    if (onSelect) {
        label = node("button", "", "object-network-label");
        label.type = "button";
        label.addEventListener("click", onSelect);
    }
    label.append(node("strong", name, ""));
    if (detail !== "") {
        label.append(node("small", detail, ""));
    }
    row.append(label);
    if (value !== null) {
        row.append(objectLevel(value));
    } else if (onSelect) {
        row.append(icon("chevron-right"));
    }
    return row;
}

// 展示导线两端，点击其中任意一行可查看该端点并定位到画布
export function wireEndpoints(wire, result, onInspectEndpoint) {
    const section = objectSection("导线端点");
    const list = node("ul", "", "object-network-list wire-endpoints");
    for (const endpoint of [wire.from, wire.to]) {
        const value = readEndpoint(result, endpoint);
        const label = endpointLabel(endpoint);
        const action = onInspectEndpoint.bind(null, endpoint);
        list.append(networkRow(label, endpoint, value, action));
    }
    section.append(list);
    return section;
}

// 读取实际驱动来源，悬空网络不会被误标为有信号输入
function networkDrivers(result, root) {
    const section = objectSection("驱动来源");
    const drivers = result.drivers[root];
    if (!drivers || drivers.length === 0) {
        section.append(node("p", "无有效驱动", "object-empty"));
        return section;
    }
    const list = node("ul", "", "object-network-list");
    for (const driver of drivers) {
        list.append(networkRow(driver.source, "", driver.value));
    }
    section.append(list);
    return section;
}

// 按实际连通关系列出芯片脚与导线，省略正在查看的那根导线
function networkMembers(project, result, root, wireId, onInspectWire) {
    const section = objectSection("同网连接");
    const list = node("ul", "", "object-network-list");
    for (const chip of project.chips) {
        const model = CHIP_MODELS[chip.model];
        for (let pin = 1; pin <= model.count; pin = pin + 1) {
            const hole = pinHole(chip, pin);
            if (nodeFor(result.topology, hole) === root) {
                const name = chip.id + "-" + pin + " · " + model.labels[pin];
                list.append(networkRow(name, chip.model, null));
            }
        }
    }
    for (const wire of project.wires) {
        if (wire.id !== wireId && nodeFor(result.topology, wire.from) === root) {
            const route = endpointLabel(wire.from) + " → " + endpointLabel(wire.to);
            const action = onInspectWire.bind(null, wire.id);
            list.append(networkRow(wire.id, route, null, action));
        }
    }
    if (list.childElementCount === 0) {
        section.append(node("p", "没有其他导线或芯片脚", "object-empty"));
    } else {
        section.append(list);
    }
    return section;
}

// 将当前端点的驱动与连接附到检查区，不重新运行仿真
export function appendNetworkDetails(container, state, endpoint, wireId, onInspectWire) {
    const result = state.result;
    const root = nodeFor(result.topology, endpoint);
    container.append(networkDrivers(result, root));
    container.append(networkMembers(state.project, result, root, wireId, onInspectWire));
}
