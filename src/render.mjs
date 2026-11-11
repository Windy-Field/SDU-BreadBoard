import { chipBounds, wirePoints, wireDisplayPaths, objectSelected } from "./geometry.mjs";
import { angleWirePath } from "./wire-path.mjs";
import { BOARD, PORT_LAYOUT, RAIL_LAYOUT, IO_LIMIT, ROWS, BUS_ROWS, BUS_SEGMENTS, busHasHole, isInputColumn, endpointPosition, portHole, holeId, pinHole, rowY } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";
import { readEndpoint, nodeFor } from "./engine.mjs";

// 绘图参数：尺寸与字号为逻辑像素，像素倍率只影响清晰度
export const DRAW = {
    pixelRatio: 2,
    holeRadius: 3.5,
    wireWidth: 2.4,
    selectedWireWidth: 5,
    wireOutlineWidth: 2,
    wireEndpointRadius: 4,
    handleSize: 10,
    chipText: 10,
    railLabelOffset: 17,
    railLinePadding: 10,
    sectionTopOffset: 30,
    sectionHeight: 234,
    boardRadius: 8
};
// 输入模块相对端口的偏移，调整位置时不改变电气端点
const INPUT_DRAW = {
    top: -25,
    height: 107,
    label: -14,
    switchTop: 20,
    switchSlider: 37,
    switchTravel: 14,
    valueLabel: 67,
    ledTop: 9,
    pulseCenter: 38,
    pulseRadius: 14,
    pulsePressedOffset: 3,
    railLabel: 25
};
// 输出模块的位置和尺寸，和输入模块使用相同的板宽
const OUTPUT_DRAW = { top: 14, height: 65, titleX: 1122, titleY: 35, ledY: 34, valueY: 40, labelY: 24 };
// 每个五孔组只显示一枚字符标签，尺寸单位为逻辑像素
const LEVEL_DRAW = { width: 13, height: 14, fontSize: 10, railInterval: 5 };
// 板内固定连线常显为细线，开启内部连通后加深，不属于用户导线
const INTERNAL_DRAW = { lineWidth: 1, restingOpacity: 0.45, activeOpacity: 0.9 };
// 从样式读取的语义颜色名称，画布与界面共用配色
const COLOR_NAMES = ["board", "hole", "hole-edge", "chip", "chip-text", "module", "module-text", "metal", "trace", "led-on", "led-off", "unknown", "level-floating", "ink", "muted", "rule", "accent", "paper", "surface", "error", "success"];
let drawingFont = "";

// 从页面样式读取画布使用的颜色，返回配色对象
function canvasColors() {
    const style = getComputedStyle(document.documentElement);
    const colors = {};
    for (const name of COLOR_NAMES) {
        colors[name] = style.getPropertyValue("--color-" + name).trim();
    }
    drawingFont = style.getPropertyValue("--font-body").trim();
    return colors;
}

// 绘制带圆角的实心矩形，参数为位置、尺寸、圆角和填充色
function rectangle(context, left, top, width, height, radius, color) {
    context.beginPath();
    context.roundRect(left, top, width, height, radius);
    context.fillStyle = color;
    context.fill();
}

// 在指定位置画文字，参数包含字号、颜色及对齐方式
function label(context, content, horizontal, vertical, size, color, align) {
    context.font = size + "px " + drawingFont;
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillText(content, horizontal, vertical);
}

// 绘制折线，参数为点数组、颜色和线宽
function polyline(context, points, color, width) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index = index + 1) {
        context.lineTo(points[index].x, points[index].y);
    }
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
}

// 绘制圆形端点，参数为位置、半径和填充色
function circle(context, horizontal, vertical, radius, color) {
    context.beginPath();
    context.arc(horizontal, vertical, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
}

// 生成可供接线的所有端点名，芯片占用的孔也保留用于查看引脚
export function allEndpoints() {
    const endpoints = [];
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        for (const row of ROWS) {
            for (let column = 1; column <= BOARD.columns; column = column + 1) {
                endpoints.push(holeId(section, row, column));
            }
        }
        for (const row of BUS_ROWS) {
            for (let column = 1; column <= BOARD.columns; column = column + 1) {
                if (busHasHole(column)) {
                    endpoints.push(holeId(section, row, column));
                }
            }
        }
    }
    for (let index = 0; index < RAIL_LAYOUT.count; index = index + 1) {
        endpoints.push("R:GND:" + index);
        endpoints.push("R:VCC:" + index);
    }
    return endpoints;
}

// 绘制面包板孔和内部五孔连通线，不跨接中央沟槽
function drawBreadboards(context, state, colors) {
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        const top = BOARD.startY + section * BOARD.sectionHeight - DRAW.sectionTopOffset;
        rectangle(context, BOARD.panelLeft, top, BOARD.panelWidth, DRAW.sectionHeight, 7, colors.surface);
        context.strokeStyle = colors.rule;
        context.lineWidth = 1;
        context.strokeRect(43, top + 1, 1130, 232);
        rectangle(context, 64, rowY(section, "E") + 15, 1086, 30, 3, colors.board);
        label(context, String(section + 1), 55, top + 116, 12, colors.muted, "center");
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
            const horizontal = BOARD.startX + (column - 1) * BOARD.pitch;
            if (column === 1 || column % 5 === 0) {
                label(context, String(column), horizontal, top + 3, 9, colors.muted, "center");
            }
            if (state.visual.internals > 0) {
                context.globalAlpha = state.visual.internals;
                polyline(context, [{ x: horizontal, y: rowY(section, "A") }, { x: horizontal, y: rowY(section, "E") }], colors.trace, 2);
                polyline(context, [{ x: horizontal, y: rowY(section, "F") }, { x: horizontal, y: rowY(section, "J") }], colors.trace, 2);
                context.globalAlpha = 1;
            }
        }
        for (const row of BUS_ROWS) {
            const vertical = rowY(section, row);
            label(context, row, 74, vertical, 9, colors.muted, "center");
            // 三段母线默认只在各自段内相通，不能跨段画成整条线
            for (const segment of BUS_SEGMENTS) {
                const first = endpointPosition(holeId(section, row, segment[0]));
                const last = endpointPosition(holeId(section, row, segment[1]));
                context.globalAlpha = 0.25 + state.visual.internals * 0.75;
                polyline(context, [first, last], colors.accent, 2);
                context.globalAlpha = 1;
            }
            for (let column = 1; column <= BOARD.columns; column = column + 1) {
                if (busHasHole(column)) {
                    const location = endpointPosition(holeId(section, row, column));
                    circle(context, location.x, location.y, DRAW.holeRadius + 1, colors["hole-edge"]);
                    circle(context, location.x, location.y, DRAW.holeRadius, colors.hole);
                }
            }
        }
        for (const row of ROWS) {
            label(context, row, 74, rowY(section, row), 9, colors.muted, "center");
            for (let column = 1; column <= BOARD.columns; column = column + 1) {
                const location = endpointPosition(holeId(section, row, column));
                circle(context, location.x, location.y, DRAW.holeRadius + 1, colors["hole-edge"]);
                circle(context, location.x, location.y, DRAW.holeRadius, colors.hole);
            }
        }
    }
    // 右侧两列固定为地和电源，顺序与用户的实物板一致
    const railTop = RAIL_LAYOUT.startY - DRAW.railLinePadding;
    const railBottom = RAIL_LAYOUT.endY + DRAW.railLinePadding;
    const railLabel = RAIL_LAYOUT.startY - DRAW.railLabelOffset;
    polyline(context, [{ x: RAIL_LAYOUT.groundX, y: railTop }, { x: RAIL_LAYOUT.groundX, y: railBottom }], colors.hole, 3);
    polyline(context, [{ x: RAIL_LAYOUT.powerX, y: railTop }, { x: RAIL_LAYOUT.powerX, y: railBottom }], colors.error, 3);
    label(context, "GND", RAIL_LAYOUT.groundX, railLabel, 11, colors.ink, "center");
    label(context, "+5V", RAIL_LAYOUT.powerX, railLabel, 11, colors.error, "center");
    for (let index = 0; index < RAIL_LAYOUT.count; index = index + 1) {
        for (const name of ["GND", "VCC"]) {
            const location = endpointPosition("R:" + name + ":" + index);
            circle(context, location.x, location.y, 4.4, colors["hole-edge"]);
            circle(context, location.x, location.y, 3.2, colors.hole);
        }
    }
}

// 绘制板载按键和指示灯模块，返回值不需要保存
function drawModules(context, state, colors) {
    const inputY = PORT_LAYOUT.inputY;
    rectangle(context, BOARD.panelLeft, OUTPUT_DRAW.top, BOARD.panelWidth, OUTPUT_DRAW.height, 5, colors.module);
    rectangle(context, BOARD.panelLeft, inputY + INPUT_DRAW.top, BOARD.panelWidth, INPUT_DRAW.height, 5, colors.module);
    label(context, "逻辑指示灯", OUTPUT_DRAW.titleX, OUTPUT_DRAW.titleY, 12, colors["module-text"], "center");
    for (let index = 0; index < IO_LIMIT; index = index + 1) {
        const led = endpointPosition("L" + index);
        const value = readEndpoint(state.result, "L" + index);
        rectangle(context, led.x - 8, OUTPUT_DRAW.ledY, 16, 13, 3, colors["led-off"]);
        context.globalAlpha = state.visual.leds["L" + index];
        rectangle(context, led.x - 8, OUTPUT_DRAW.ledY, 16, 13, 3, colors["led-on"]);
        context.globalAlpha = 1;
        if (value === "X" || value === "Z") {
            label(context, String(value), led.x, OUTPUT_DRAW.valueY, 8, colors["module-text"], "center");
        }
        label(context, "L" + index, led.x, OUTPUT_DRAW.labelY, 8, colors["module-text"], "center");
        const location = endpointPosition("K" + index);
        label(context, "K" + index, location.x, inputY + INPUT_DRAW.label, 9, colors["module-text"], "center");
        rectangle(context, location.x - 12, inputY + INPUT_DRAW.switchTop, 24, 36, 4, colors["chip-text"]);
        const switchTop = inputY + INPUT_DRAW.switchSlider - state.visual.switches[index] * INPUT_DRAW.switchTravel;
        rectangle(context, location.x - 9, switchTop, 18, 15, 2, colors.metal);
        label(context, String(state.project.switches[index]), location.x, inputY + INPUT_DRAW.valueLabel, 10, colors["module-text"], "center");
        rectangle(context, location.x - 6, inputY + INPUT_DRAW.ledTop, 12, 6, 2, colors["led-off"]);
        context.globalAlpha = state.visual.leds["K" + index];
        rectangle(context, location.x - 6, inputY + INPUT_DRAW.ledTop, 12, 6, 2, colors["led-on"]);
        context.globalAlpha = 1;
    }
    for (const name of ["P+", "P-"]) {
        const location = endpointPosition(name);
        label(context, name, location.x, inputY + INPUT_DRAW.label, 10, colors["module-text"], "center");
        let buttonColor = colors["chip-text"];
        let buttonY = inputY + INPUT_DRAW.pulseCenter;
        if (state.pressedPulse === name) {
            buttonColor = colors["led-on"];
            buttonY = buttonY + INPUT_DRAW.pulsePressedOffset;
        }
        circle(context, location.x, buttonY, INPUT_DRAW.pulseRadius, buttonColor);
        label(context, "脉冲", location.x, inputY + INPUT_DRAW.valueLabel, 9, colors["module-text"], "center");
    }
}

// 用细线连接板载标识与对应孔列，内部连通模式同时强调两条电源轨
function drawPortConnections(context, state, colors) {
    const emphasis = state.visual.internals;
    context.globalAlpha = INTERNAL_DRAW.restingOpacity + emphasis * (INTERNAL_DRAW.activeOpacity - INTERNAL_DRAW.restingOpacity);
    const signals = ["P+", "P-"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        signals.push("K" + bit, "L" + bit);
    }
    for (const signal of signals) {
        const location = endpointPosition(signal);
        const first = { x: location.x, y: PORT_LAYOUT.inputY + INPUT_DRAW.top };
        if (signal.startsWith("L")) {
            first.y = OUTPUT_DRAW.top + OUTPUT_DRAW.height;
        }
        const last = endpointPosition(portHole(signal));
        polyline(context, [first, last], colors.trace, INTERNAL_DRAW.lineWidth);
    }
    // 第四块的输入对应列跨过中央沟槽，细线表示固定桥接，不占用插孔
    const section = BOARD.sections - 1;
    for (let column = 1; column <= BOARD.columns; column = column + 1) {
        if (isInputColumn(column)) {
            const first = endpointPosition(holeId(section, "E", column));
            const last = endpointPosition(holeId(section, "F", column));
            polyline(context, [first, last], colors.trace, INTERNAL_DRAW.lineWidth);
        }
    }
    context.globalAlpha = emphasis;
    // 两条电源轨各自从首孔连到末孔，不能跨接地和电源
    for (const rail of ["GND", "VCC"]) {
        const first = endpointPosition("R:" + rail + ":0");
        const last = endpointPosition("R:" + rail + ":" + (RAIL_LAYOUT.count - 1));
        let color = colors.ink;
        if (rail === "VCC") {
            color = colors.error;
        }
        polyline(context, [first, last], color, 4);
        for (let index = 0; index < RAIL_LAYOUT.count; index = index + 1) {
            const point = endpointPosition("R:" + rail + ":" + index);
            circle(context, point.x, point.y, 2, color);
        }
    }
    context.globalAlpha = 1;
}

// 绘制带字符的电平标签，0、1、X、Z 都有明确文字，不仅依赖颜色
function drawLevel(context, name, point, state, colors) {
    const value = readEndpoint(state.result, name);
    let background = colors["level-floating"];
    let foreground = colors.ink;
    if (value === 1) {
        background = colors.success;
        foreground = colors.surface;
    } else if (value === 0) {
        background = colors.ink;
        foreground = colors.surface;
    } else if (value === "X") {
        background = colors.unknown;
    }
    rectangle(context, point.x - LEVEL_DRAW.width / 2, point.y - LEVEL_DRAW.height / 2, LEVEL_DRAW.width, LEVEL_DRAW.height, 2, colors.surface);
    rectangle(context, point.x - LEVEL_DRAW.width / 2 + 1, point.y - LEVEL_DRAW.height / 2 + 1, LEVEL_DRAW.width - 2, LEVEL_DRAW.height - 2, 1, background);
    label(context, String(value), point.x, point.y, LEVEL_DRAW.fontSize, foreground, "center");
}

// 每列上下五孔组各标一次，横向母线每段标一次，电源轨定距标注
function drawNodeLevels(context, state, colors) {
    if (!state.showLevels) {
        return;
    }
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        for (let column = 1; column <= BOARD.columns; column = column + 1) {
            for (const row of ["C", "H"]) {
                const name = holeId(section, row, column);
                drawLevel(context, name, endpointPosition(name), state, colors);
            }
        }
        for (const row of BUS_ROWS) {
            for (const segment of BUS_SEGMENTS) {
                const name = holeId(section, row, segment[0]);
                drawLevel(context, name, endpointPosition(name), state, colors);
            }
        }
    }
    for (const rail of ["GND", "VCC"]) {
        for (let index = 0; index < RAIL_LAYOUT.count; index = index + LEVEL_DRAW.railInterval) {
            const name = "R:" + rail + ":" + index;
            drawLevel(context, name, endpointPosition(name), state, colors);
        }
    }
}

// 绘制芯片的封装、缺口、引脚和脚号
function drawChip(context, chip, state, colors) {
    const bounds = chipBounds(chip);
    const model = CHIP_MODELS[chip.model];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
        const location = endpointPosition(pinHole(chip, pin));
        let edge = bounds.y + bounds.height;
        if (pin > model.count / 2) {
            edge = bounds.y;
        }
        polyline(context, [location, { x: location.x, y: edge }], colors.metal, 5);
    }
    rectangle(context, bounds.x, bounds.y, bounds.width, bounds.height, 3, colors.chip);
    circle(context, bounds.x, bounds.y + 16, 6, colors.board);
    label(context, chip.id + "  " + chip.model, bounds.x + bounds.width / 2 + 3, bounds.y + 16, DRAW.chipText, colors["chip-text"], "center");
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
        const location = endpointPosition(pinHole(chip, pin));
        let vertical = bounds.y + bounds.height - 3;
        if (pin > model.count / 2) {
            vertical = bounds.y + 4;
        }
        label(context, String(pin), location.x, vertical, 6, colors["chip-text"], "center");
    }
    if (objectSelected(state, "chip", chip.id)) {
        context.strokeStyle = colors.accent;
        context.lineWidth = 2;
        context.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
    }
}

// 绘制导线，选中的线加粗；端点圆圈与普通交叉区分
function drawWires(context, state, colors) {
    const displayPaths = wireDisplayPaths(state.project.wires);
    for (let index = 0; index < state.project.wires.length; index = index + 1) {
        const wire = state.project.wires[index];
        const points = displayPaths[index];
        let width = DRAW.wireWidth;
        const selected = objectSelected(state, "wire", wire.id);
        if (selected) {
            width = DRAW.selectedWireWidth;
        }
        polyline(context, points, colors.surface, width + DRAW.wireOutlineWidth);
        polyline(context, points, wire.color, width);
        const first = points[0];
        const last = points[points.length - 1];
        circle(context, first.x, first.y, DRAW.wireEndpointRadius, wire.color);
        circle(context, last.x, last.y, DRAW.wireEndpointRadius, wire.color);
        if (selected && state.tool === "select") {
            for (const point of points) {
                rectangle(context, point.x - DRAW.handleSize / 2, point.y - DRAW.handleSize / 2, DRAW.handleSize, DRAW.handleSize, 2, colors.surface);
                context.strokeStyle = wire.color;
                context.lineWidth = 2;
                context.strokeRect(point.x - DRAW.handleSize / 2, point.y - DRAW.handleSize / 2, DRAW.handleSize, DRAW.handleSize);
            }
        }
    }
    if (state.pending) {
        let points = [endpointPosition(state.pending.from)];
        for (const bend of state.pending.bends) {
            points.push(bend);
        }
        if (state.pointer) {
            points.push(state.pointer);
        }
        if (state.wireAngle === 45) {
            points = angleWirePath(points);
        }
        context.setLineDash([6, 4]);
        polyline(context, points, state.wireColor, 2.5);
        context.setLineDash([]);
    }
}

// 绘制选中节点的同组孔高亮，以及可选的节点电平
function drawHighlights(context, state, endpoints, colors) {
    let selectedNode = "";
    if (state.selected && state.selected.kind === "node") {
        selectedNode = nodeFor(state.result.topology, state.selected.id);
    }
    for (const name of endpoints) {
        const node = nodeFor(state.result.topology, name);
        const location = endpointPosition(name);
        if (selectedNode !== "" && node === selectedNode) {
            context.strokeStyle = colors.accent;
            context.lineWidth = 2;
            context.beginPath();
            context.arc(location.x, location.y, 6.2, 0, Math.PI * 2);
            context.stroke();
        }
    }
    if (state.hovered) {
        const location = endpointPosition(state.hovered);
        context.strokeStyle = colors.accent;
        context.lineWidth = 2;
        context.strokeRect(location.x - 8, location.y - 8, 16, 16);
    }
}

// 重绘整个面包板，参数为画布、界面状态和所有可连接端点
export function renderBoard(canvas, state, endpoints) {
    const context = canvas.getContext("2d");
    context.setTransform(DRAW.pixelRatio, 0, 0, DRAW.pixelRatio, 0, 0);
    const colors = canvasColors();
    context.clearRect(0, 0, BOARD.width, BOARD.height);
    rectangle(context, 0, 0, BOARD.width, BOARD.height, DRAW.boardRadius, colors.board);
    drawBreadboards(context, state, colors);
    drawModules(context, state, colors);
    drawPortConnections(context, state, colors);
    for (const chip of state.project.chips) {
        drawChip(context, chip, state, colors);
    }
    drawWires(context, state, colors);
    drawHighlights(context, state, endpoints, colors);
    drawNodeLevels(context, state, colors);
    if (state.placing) {
        label(context, "放置 " + state.placing, 650, 1105, 17, colors.accent, "center");
    }
}
