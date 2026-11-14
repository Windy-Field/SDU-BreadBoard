import { element, node, refreshIcons } from "./dom.mjs";
import { buildLogicDiagram } from "./logic-diagram.mjs";
import { layoutLogicDiagram } from "./logic-diagram-layout.mjs";

// 缩放上下限、步长与下载地址释放时间集中维护
const VIEW_OPTIONS = {
    minimum: 0.15, maximum: 2.5, step: 0.15, margin: 24, releaseDelay: 1000,
    wheelSpeed: 0.0015, wheelLinePixels: 16, dragThreshold: 4
};
// 导出 SVG 时复制实际样式，文件离开网页后仍保留字号、线色和透明度
const EXPORT_PROPERTIES = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "font-family", "font-size", "font-weight", "text-anchor", "opacity", "paint-order"];
// 布局期间暂停图纸操作，关闭按钮始终可用
const DIAGRAM_CONTROLS = ["logic-export", "logic-show-power", "logic-fit", "logic-zoom-in", "logic-zoom-out", "logic-network"];
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
// 引脚短线和反相圈使用图纸坐标，符号不再采用资料卡片的标题栏
const SYMBOL_DRAW = { bubbleRadius: 3.5, junctionRadius: 4.5, numberOffset: 7, numberRise: 4, labelOffset: 9 };
let currentDiagram = null;
let currentGraph = null;
let currentProject = null;
let currentResult = null;
let zoom = 1;
let generation = 0;
let pan = null;
let suppressClick = false;

// 创建 SVG 节点，绘图只设置几何属性，配色和字体由样式文件维护
function svgElement(parent, name, attributes, text = "") {
    const shape = document.createElementNS(SVG_NAMESPACE, name);
    for (const key of Object.keys(attributes)) {
        shape.setAttribute(key, String(attributes[key]));
    }
    if (text !== "") {
        shape.textContent = text;
    }
    parent.append(shape);
    return shape;
}

// 找到端点所属网络，电源标签和线路点击都使用同一份完整网络
function terminalNetwork(terminal) {
    for (const network of currentDiagram.nets) {
        if (network.root === terminal.root) {
            return network;
        }
    }
    return null;
}

// 将网络编号与当前电平写入图形，键盘聚焦后也能查看端点列表
function makeNetworkTarget(shape, network) {
    shape.dataset.net = network.id;
    shape.dataset.level = String(network.level);
    shape.setAttribute("tabindex", "0");
    shape.setAttribute("role", "button");
    shape.setAttribute("aria-label", network.id + "，电平 " + network.level);
}

// 绘制正交路径，交叉不带连接点，不同网络仍可分别选中
function drawEdge(svg, edge) {
    const network = currentDiagram.nets.find(findEdgeNetwork.bind(null, edge.netId));
    for (const section of edge.sections || []) {
        let path = "M " + section.startPoint.x + " " + section.startPoint.y;
        for (const point of section.bendPoints || []) {
            path = path + " L " + point.x + " " + point.y;
        }
        path = path + " L " + section.endPoint.x + " " + section.endPoint.y;
        const group = svgElement(svg, "g", { class: "logic-edge" });
        makeNetworkTarget(group, network);
        svgElement(group, "path", { d: path, class: "logic-wire-halo" });
        svgElement(group, "path", { d: path, class: "logic-wire" });
        svgElement(group, "path", { d: path, class: "logic-wire-hit" });
        svgElement(group, "title", {}, network.id + " · " + network.members.length + " 个端点");
    }
}

// 全部线路画完后再标分岔点，只采纳 ELK 提供的同一网络连接点
function drawJunctions(svg) {
    const drawn = new Set();
    const layer = svgElement(svg, "g", { class: "logic-junction-layer" });
    for (const edge of currentGraph.edges) {
        for (const point of edge.junctionPoints || []) {
            const key = edge.netId + ":" + point.x + ":" + point.y;
            if (drawn.has(key)) {
                continue;
            }
            drawn.add(key);
            svgElement(layer, "circle", {
                cx: point.x,
                cy: point.y,
                r: SYMBOL_DRAW.junctionRadius,
                class: "logic-junction",
                "data-net": edge.netId
            });
        }
    }
}

// Array.find 的命名回调只比较网络编号，不修改模型
function findEdgeNetwork(id, network) {
    return network.id === id;
}

// 绘制物理脚名和电平，未接线引脚也保留可辨认的空心端点
function drawPort(group, port, item) {
    const terminal = port.terminal;
    const right = terminal.direction === "output";
    const centerX = port.x + port.width / 2;
    const centerY = port.y + port.height / 2;
    const body = item.body;
    let boundary = body.x;
    let textX = boundary + SYMBOL_DRAW.labelOffset;
    let anchor = "start";
    let numberX = centerX + SYMBOL_DRAW.numberOffset;
    if (right) {
        boundary = body.x + body.width;
        textX = boundary - SYMBOL_DRAW.labelOffset;
        anchor = "end";
        numberX = centerX - SYMBOL_DRAW.numberOffset;
    }
    let label = terminal.name;
    const network = terminalNetwork(terminal);
    if (network && network.rail !== "" && !element("logic-show-power").checked) {
        label = label + " · " + network.rail;
    }
    const target = svgElement(group, "g", { class: "logic-pin" });
    if (network) {
        makeNetworkTarget(target, network);
    }
    let inverted = false;
    if (right && item.block.inverted) {
        inverted = true;
    }
    if (item.block.symbol === "" && /[′̅]/u.test(terminal.name)) {
        inverted = true;
    }
    if (item.block.symbol === "BUF" && /[′̅]/u.test(terminal.name)) {
        inverted = true;
    }
    let wireBoundary = boundary;
    let bubbleX = boundary;
    if (inverted) {
        if (right) {
            wireBoundary = boundary + SYMBOL_DRAW.bubbleRadius * 2;
            bubbleX = boundary + SYMBOL_DRAW.bubbleRadius;
        } else {
            wireBoundary = boundary - SYMBOL_DRAW.bubbleRadius * 2;
            bubbleX = boundary - SYMBOL_DRAW.bubbleRadius;
        }
    }
    svgElement(target, "line", { x1: centerX, y1: centerY, x2: wireBoundary, y2: centerY, class: "logic-pin-lead" });
    if (inverted) {
        svgElement(target, "circle", { cx: bubbleX, cy: centerY, r: SYMBOL_DRAW.bubbleRadius, class: "logic-inversion" });
    }
    svgElement(target, "text", {
        x: numberX,
        y: centerY - SYMBOL_DRAW.numberRise,
        "text-anchor": anchor,
        class: "logic-pin-number"
    }, String(terminal.pin));
    if (item.block.symbol === "") {
        svgElement(target, "text", { x: textX, y: centerY + 4, "text-anchor": anchor, class: "logic-pin-label" }, label);
    } else if (network && network.rail !== "" && !element("logic-show-power").checked) {
        svgElement(target, "text", {
            x: numberX, y: centerY + 11, "text-anchor": anchor, class: "logic-power-label"
        }, network.rail);
    }
    svgElement(target, "title", {}, terminal.label + " · " + terminal.level);
}

// 将供电信息放在元件底部，默认不让长电源线覆盖信号数据流
function drawPowerLabels(group, block, height) {
    const parts = [];
    for (const terminal of block.powerPins) {
        const network = terminalNetwork(terminal);
        let text = terminal.pin + " " + terminal.name + ":Z";
        if (network) {
            text = terminal.pin + " " + terminal.name + ":" + network.id;
        }
        parts.push(text);
    }
    svgElement(group, "text", { x: 12, y: height - 12, class: "logic-power-label" }, parts.join(" · "));
}

// 功能块保留芯片编号和物理脚号，门电路使用矩形 IEC 符号
function drawNode(svg, item) {
    const group = svgElement(svg, "g", { transform: "translate(" + item.x + " " + item.y + ")", class: "logic-component" });
    group.dataset.component = item.id;
    if (item.boardPort) {
        const port = item.boardPort;
        const network = terminalNetwork(port.terminal);
        const terminal = item.ports[0];
        let labelX = 0;
        let wireEnd = item.width - 24;
        if (port.terminal.direction !== "output") {
            labelX = 20;
            wireEnd = 16;
        }
        svgElement(group, "text", { x: labelX, y: 18, class: "logic-component-title" }, port.title);
        svgElement(group, "text", { x: labelX, y: 34, class: "logic-level-text" }, String(port.terminal.level));
        svgElement(group, "line", {
            x1: terminal.x + terminal.width / 2,
            y1: terminal.y + terminal.height / 2,
            x2: wireEnd,
            y2: terminal.y + terminal.height / 2,
            class: "logic-pin-lead"
        });
        if (network) {
            makeNetworkTarget(group, network);
        }
        return;
    }
    const block = item.block;
    const body = item.body;
    svgElement(group, "rect", {
        x: body.x, y: body.y, width: body.width, height: body.height, class: "logic-component-body"
    });
    svgElement(group, "text", {
        x: item.width / 2, y: 15, "text-anchor": "middle", class: "logic-component-title"
    }, block.title);
    if (block.symbol !== "") {
        svgElement(group, "text", {
            x: item.width / 2, y: body.y + body.height / 2 + 6, "text-anchor": "middle", class: "logic-gate-symbol"
        }, block.symbol);
        svgElement(group, "text", {
            x: item.width / 2, y: item.height - 7, "text-anchor": "middle", class: "logic-component-subtitle"
        }, block.subtitle);
    } else {
        drawPowerLabels(group, block, item.height);
        if (block.functionSymbol) {
            svgElement(group, "text", {
                x: item.width / 2, y: body.y + body.height / 2 + 5,
                "text-anchor": "middle", class: "logic-function-symbol"
            }, block.functionSymbol);
        }
    }
    for (const port of item.ports) {
        drawPort(group, port, item);
    }
    svgElement(group, "title", {}, block.title + " · " + block.subtitle);
}

// 把布局结果转换为图纸，图形和网络核对信息均来自同一份快照
function drawGraph() {
    const svg = element("logic-diagram");
    svg.replaceChildren();
    svg.setAttribute("viewBox", "0 0 " + currentGraph.width + " " + currentGraph.height);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "当前电路逻辑连线图");
    svgElement(svg, "rect", { width: currentGraph.width, height: currentGraph.height, class: "logic-paper" });
    for (const edge of currentGraph.edges) {
        drawEdge(svg, edge);
    }
    drawJunctions(svg);
    for (const item of currentGraph.children) {
        drawNode(svg, item);
    }
    if (currentGraph.children.length === 0) {
        svgElement(svg, "text", { x: 24, y: 60, class: "logic-component-title" }, "当前实验没有芯片或连线");
    }
    const select = element("logic-network");
    const placeholder = node("option", "网络核对", "");
    placeholder.value = "";
    select.replaceChildren(placeholder);
    for (const network of currentDiagram.nets) {
        const option = node("option", network.id + " · " + network.members[0].label, "");
        option.value = network.id;
        select.append(option);
    }
    element("logic-network-members").replaceChildren();
    fitLogicDiagram();
}

// 重新生成图纸时保留工程与仿真的原对象，仅读取当前网络数据
async function generateDiagram() {
    finishDiagramPan();
    const request = generation + 1;
    generation = request;
    element("logic-diagram-dialog").setAttribute("aria-busy", "true");
    element("logic-diagram-summary").textContent = "正在生成逻辑图";
    for (const id of DIAGRAM_CONTROLS) {
        element(id).disabled = true;
    }
    try {
        const diagram = buildLogicDiagram(currentProject, currentResult);
        const graph = await layoutLogicDiagram(diagram, element("logic-show-power").checked);
        if (generation !== request || !element("logic-diagram-dialog").open) {
            return;
        }
        currentDiagram = diagram;
        currentGraph = graph;
        drawGraph();
        element("logic-diagram-summary").textContent = currentProject.chips.length + " 片芯片 · " +
            diagram.blocks.length + " 个逻辑元件 · " + diagram.nets.length + " 组网络";
        for (const id of DIAGRAM_CONTROLS) {
            element(id).disabled = false;
        }
    } catch (error) {
        if (generation !== request || !element("logic-diagram-dialog").open) {
            return;
        }
        element("logic-diagram-summary").textContent = "逻辑图生成失败：" + error.message;
        element("logic-show-power").disabled = false;
    } finally {
        if (generation === request) {
            element("logic-diagram-dialog").setAttribute("aria-busy", "false");
        }
    }
}

// 打开只读逻辑图，所有图纸操作均不改变原接线、输入或寄存器
export function openLogicDiagram(project, result) {
    currentProject = project;
    currentResult = result;
    element("logic-diagram-dialog").showModal();
    generateDiagram();
}

// 关闭窗口后作废尚未返回的布局结果
function closeLogicDiagram() {
    generation = generation + 1;
    element("logic-diagram-dialog").close();
}

// 按指定比例显示图纸，默认保持画布中心不动，也可传入鼠标位置作为缩放中心
function setLogicZoom(value, anchor = null) {
    if (!currentGraph) {
        return;
    }
    const viewport = element("logic-diagram-scroll");
    const svg = element("logic-diagram");
    const bounds = viewport.getBoundingClientRect();
    let offsetX = viewport.clientWidth / 2;
    let offsetY = viewport.clientHeight / 2;
    if (anchor) {
        offsetX = anchor.clientX - bounds.left - viewport.clientLeft;
        offsetY = anchor.clientY - bounds.top - viewport.clientTop;
    }
    const diagramX = (viewport.scrollLeft + offsetX) / zoom;
    const diagramY = (viewport.scrollTop + offsetY) / zoom;
    zoom = Math.max(VIEW_OPTIONS.minimum, Math.min(VIEW_OPTIONS.maximum, value));
    svg.style.width = currentGraph.width * zoom + "px";
    svg.style.height = currentGraph.height * zoom + "px";
    element("logic-zoom-label").textContent = Math.round(zoom * 100) + "%";
    // 补偿尺寸变化引起的偏移，让缩放前后观察的是同一个电路位置
    viewport.scrollLeft = diagramX * zoom - offsetX;
    viewport.scrollTop = diagramY * zoom - offsetY;
}

// 默认按可用宽度适应图纸，保留最低缩放以免文字完全不可辨认
function fitLogicDiagram() {
    if (currentGraph) {
        const width = element("logic-diagram-scroll").clientWidth - VIEW_OPTIONS.margin;
        setLogicZoom(width / currentGraph.width);
        element("logic-diagram-scroll").scrollLeft = 0;
        element("logic-diagram-scroll").scrollTop = 0;
    }
}

// 放大逻辑图，线段和文字一起缩放
function zoomInLogicDiagram() {
    setLogicZoom(zoom + VIEW_OPTIONS.step);
}

// 缩小逻辑图，不影响面包板原有缩放
function zoomOutLogicDiagram() {
    setLogicZoom(zoom - VIEW_OPTIONS.step);
}

// Ctrl 或 Command 加滚轮缩放，普通滚轮仍交给浏览器滚动图纸
function wheelLogicDiagram(event) {
    if (!event.ctrlKey && !event.metaKey) {
        return;
    }
    event.preventDefault();
    if (!currentGraph || element("logic-diagram-dialog").getAttribute("aria-busy") === "true") {
        return;
    }
    let delta = event.deltaY;
    if (event.deltaMode === 1) {
        delta = delta * VIEW_OPTIONS.wheelLinePixels;
    } else if (event.deltaMode === 2) {
        delta = delta * element("logic-diagram-scroll").clientHeight;
    }
    const scale = Math.exp(-delta * VIEW_OPTIONS.wheelSpeed);
    setLogicZoom(zoom * scale, event);
}

// 记录鼠标拖动起点，滚动条和触摸屏继续使用浏览器自己的操作
function startDiagramPan(event) {
    if (event.pointerType !== "mouse" || pan || (event.button !== 0 && event.button !== 1)) {
        return;
    }
    if (!currentGraph || element("logic-diagram-dialog").getAttribute("aria-busy") === "true") {
        return;
    }
    const viewport = element("logic-diagram-scroll");
    const bounds = viewport.getBoundingClientRect();
    if (event.clientX >= bounds.left + viewport.clientLeft + viewport.clientWidth ||
        event.clientY >= bounds.top + viewport.clientTop + viewport.clientHeight) {
        return;
    }
    suppressClick = false;
    pan = {
        pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
        scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop, moved: false
    };
    if (event.button === 1) {
        event.preventDefault();
    }
}

// 超过小幅抖动后才平移，并捕获鼠标，让移出画布的拖动也能正常结束
function moveDiagramPan(event) {
    if (!pan || event.pointerId !== pan.pointerId) {
        return;
    }
    const distanceX = event.clientX - pan.clientX;
    const distanceY = event.clientY - pan.clientY;
    if (!pan.moved && Math.hypot(distanceX, distanceY) <= VIEW_OPTIONS.dragThreshold) {
        return;
    }
    const viewport = element("logic-diagram-scroll");
    if (!pan.moved) {
        pan.moved = true;
        suppressClick = true;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add("logic-panning");
        viewport.focus({ preventScroll: true });
    }
    event.preventDefault();
    viewport.scrollLeft = pan.scrollLeft - distanceX;
    viewport.scrollTop = pan.scrollTop - distanceY;
}

// 松开、取消、关闭窗口或重新布局时释放拖动状态和鼠标捕获
function finishDiagramPan(event = null) {
    if (!pan) {
        return;
    }
    if (event && event.pointerId !== undefined && event.pointerId !== pan.pointerId) {
        return;
    }
    const pointerId = pan.pointerId;
    pan = null;
    const viewport = element("logic-diagram-scroll");
    viewport.classList.remove("logic-panning");
    if (viewport.hasPointerCapture(pointerId)) {
        viewport.releasePointerCapture(pointerId);
    }
}

// 同时标亮一条网络的全部分支，核对表列出所有真实端点及上拉节点
function selectNetwork(id) {
    element("logic-network").value = id;
    for (const shape of element("logic-diagram").querySelectorAll("[data-net]")) {
        shape.classList.toggle("logic-active-net", shape.dataset.net === id);
    }
    const members = element("logic-network-members");
    members.replaceChildren();
    for (const network of currentDiagram.nets) {
        if (network.id !== id) {
            continue;
        }
        members.append(node("strong", id + " · 电平 " + network.level, ""));
        for (const terminal of network.members) {
            members.append(node("span", terminal.label, ""));
        }
        for (const endpoint of network.pullUps) {
            members.append(node("span", "弱上拉 · " + endpoint, ""));
        }
    }
}

// 点击线路或引脚时读取所属网络，不改变芯片选择
function clickDiagram(event) {
    if (suppressClick && event.detail > 0) {
        suppressClick = false;
        return;
    }
    const target = event.target.closest("[data-net]");
    if (target) {
        selectNetwork(target.dataset.net);
    }
}

// 回车和空格提供与鼠标点线相同的网络核对操作
function keyDiagram(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        clickDiagram(event);
    }
}

// 选择网络菜单后与图纸中的线路高亮保持一致
function changeNetwork(event) {
    selectNetwork(event.currentTarget.value);
}

// 导出自带样式的 SVG，离开项目目录后仍可直接查看
function exportLogicDiagram() {
    const source = element("logic-diagram");
    const copy = source.cloneNode(true);
    copy.setAttribute("xmlns", SVG_NAMESPACE);
    copy.removeAttribute("style");
    copy.setAttribute("width", String(currentGraph.width));
    copy.setAttribute("height", String(currentGraph.height));
    const originals = source.querySelectorAll("*");
    const copies = copy.querySelectorAll("*");
    for (let index = 0; index < originals.length; index = index + 1) {
        const style = window.getComputedStyle(originals[index]);
        for (const property of EXPORT_PROPERTIES) {
            copies[index].setAttribute(property, style.getPropertyValue(property));
        }
        copies[index].removeAttribute("tabindex");
        copies[index].removeAttribute("role");
    }
    const text = new XMLSerializer().serializeToString(copy);
    const file = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = node("a", "", "");
    anchor.href = url;
    anchor.download = "breadboard-logic.svg";
    anchor.click();
    window.setTimeout(releaseLogicDownload.bind(null, url), VIEW_OPTIONS.releaseDelay);
}

// 下载开始后释放临时地址，不留下中间图纸文件
function releaseLogicDownload(url) {
    URL.revokeObjectURL(url);
}

// 将逻辑图控件绑定一次，窗口反复打开时不重复添加监听
export function bindLogicDiagram() {
    const viewport = element("logic-diagram-scroll");
    viewport.addEventListener("wheel", wheelLogicDiagram, { passive: false });
    viewport.addEventListener("pointerdown", startDiagramPan);
    viewport.addEventListener("pointermove", moveDiagramPan);
    viewport.addEventListener("lostpointercapture", finishDiagramPan);
    window.addEventListener("pointerup", finishDiagramPan);
    window.addEventListener("pointercancel", finishDiagramPan);
    element("logic-diagram-dialog").addEventListener("close", finishDiagramPan);
    element("close-logic-diagram").addEventListener("click", closeLogicDiagram);
    element("logic-show-power").addEventListener("change", generateDiagram);
    element("logic-fit").addEventListener("click", fitLogicDiagram);
    element("logic-zoom-in").addEventListener("click", zoomInLogicDiagram);
    element("logic-zoom-out").addEventListener("click", zoomOutLogicDiagram);
    element("logic-export").addEventListener("click", exportLogicDiagram);
    element("logic-network").addEventListener("change", changeNetwork);
    viewport.addEventListener("click", clickDiagram);
    element("logic-diagram").addEventListener("keydown", keyDiagram);
    refreshIcons();
}
