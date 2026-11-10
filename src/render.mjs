import { BOARD, PORT_LAYOUT, ROWS, BUS_ROWS, BUS_SEGMENTS, busHasHole, endpointPosition, holeId, pinHole, rowY } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";
import { readEndpoint, nodeFor } from "./engine.mjs";

const DRAW = { holeRadius: 3.5, wireWidth: 2.4, pickRadius: 7, chipText: 10 };
let drawingFont = "";

// 从页面样式读取画布使用的颜色，返回配色对象。
export function canvasColors() {
    const style = getComputedStyle(document.documentElement);
    const colors = {};
    const names = ["board", "hole", "hole-edge", "chip", "chip-text", "module", "module-text", "metal", "trace", "led-on", "led-off", "unknown", "ink", "muted", "rule", "accent", "paper", "surface", "error", "success"];
    for (const name of names) {
        colors[name] = style.getPropertyValue("--color-" + name).trim();
    }
    drawingFont = style.getPropertyValue("--font-body").trim();
    return colors;
}

// 绘制带圆角的实心矩形，参数为位置、尺寸、圆角和填充色。
function rectangle(context, left, top, width, height, radius, color) {
    context.beginPath();
    context.roundRect(left, top, width, height, radius);
    context.fillStyle = color;
    context.fill();
}

// 在指定位置画文字，参数包含字号、颜色及对齐方式。
function label(context, content, horizontal, vertical, size, color, align) {
    context.font = size + "px " + drawingFont;
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillText(content, horizontal, vertical);
}

// 绘制折线，参数为点数组、颜色和线宽。
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

// 绘制圆形端点，参数为位置、半径和填充色。
function circle(context, horizontal, vertical, radius, color) {
    context.beginPath();
    context.arc(horizontal, vertical, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
}

// 生成可供接线的所有端点名，芯片占用的孔也保留用于查看引脚。
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
    for (let index = 0; index < 24; index = index + 1) {
        endpoints.push("K" + index);
        endpoints.push("L" + index);
    }
    for (let index = 0; index < 60; index = index + 1) {
        endpoints.push("R:GND:" + index);
        endpoints.push("R:VCC:" + index);
    }
    endpoints.push("P+", "P-", "GND", "VCC");
    return endpoints;
}

// 返回芯片在画布中的外框，用于绘制和鼠标选择。
export function chipBounds(chip) {
    const count = CHIP_MODELS[chip.model].count;
    const left = BOARD.startX + (chip.column - 1) * BOARD.pitch - 9;
    const top = rowY(chip.section, "E") + 9;
    return { x: left, y: top, width: count / 2 * BOARD.pitch, height: 32 };
}

// 返回一根导线的折线点；有手动转折点时保留原路径。
export function wirePoints(wire, index) {
    const first = endpointPosition(wire.from);
    const last = endpointPosition(wire.to);
    const points = [first];
    if (wire.bends.length > 0) {
        for (const bend of wire.bends) {
            points.push(bend);
        }
    } else {
        const laneOffset = 12 + (index % 9) * 5;
        let lane = (first.y + last.y) / 2 + laneOffset;
        if (Math.abs(first.y - last.y) < 12) {
            lane = first.y - laneOffset;
        }
        points.push({ x: first.x, y: lane });
        points.push({ x: last.x, y: lane });
    }
    points.push(last);
    return points;
}

// 绘制面包板孔和内部五孔连通线，不跨接中央沟槽。
function drawBreadboards(context, state, colors) {
    for (let section = 0; section < BOARD.sections; section = section + 1) {
        const top = BOARD.startY + section * BOARD.sectionHeight - 30;
        rectangle(context, BOARD.panelLeft, top, BOARD.panelWidth, 234, 7, colors.surface);
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
            // 三段母线默认只在各自段内相通，不能跨段画成整条线。
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
    // 右侧两列固定为地和电源，顺序与用户的实物板一致。
    polyline(context, [{ x: 1210, y: 85 }, { x: 1210, y: PORT_LAYOUT.inputY + 10 }], colors.hole, 3);
    polyline(context, [{ x: 1242, y: 85 }, { x: 1242, y: PORT_LAYOUT.inputY + 10 }], colors.error, 3);
    label(context, "GND", 1210, 83, 11, colors.ink, "center");
    label(context, "+5V", 1242, 83, 11, colors.error, "center");
    for (let index = 0; index < 60; index = index + 1) {
        for (const name of ["GND", "VCC"]) {
            const location = endpointPosition("R:" + name + ":" + index);
            circle(context, location.x, location.y, 4.4, colors["hole-edge"]);
            circle(context, location.x, location.y, 3.2, colors.hole);
        }
    }
}

// 绘制板载按键和指示灯模块，返回值不需要保存。
function drawModules(context, state, colors) {
    const offset = PORT_LAYOUT.inputY - 1170;
    rectangle(context, BOARD.panelLeft, 14, BOARD.panelWidth, 65, 5, colors.module);
    rectangle(context, BOARD.panelLeft, 1145 + offset, BOARD.panelWidth, 107, 5, colors.module);
    label(context, "逻辑指示灯", 1122, 35, 12, colors["module-text"], "center");
    for (let index = 0; index < 24; index = index + 1) {
        const led = endpointPosition("L" + index);
        const value = readEndpoint(state.result, "L" + index);
        rectangle(context, led.x - 8, 34, 16, 13, 3, colors["led-off"]);
        context.globalAlpha = state.visual.leds["L" + index];
        rectangle(context, led.x - 8, 34, 16, 13, 3, colors["led-on"]);
        context.globalAlpha = 1;
        if (value === "X" || value === "Z") {
            label(context, String(value), led.x, 40, 8, colors["module-text"], "center");
        }
        label(context, "L" + index, led.x, 24, 8, colors["module-text"], "center");
        const location = endpointPosition("K" + index);
        label(context, "K" + index, location.x, 1156 + offset, 9, colors["module-text"], "center");
        rectangle(context, location.x - 12, 1190 + offset, 24, 36, 4, colors["chip-text"]);
        const switchTop = 1207 + offset - state.visual.switches[index] * 14;
        rectangle(context, location.x - 9, switchTop, 18, 15, 2, colors.metal);
        label(context, String(state.project.switches[index]), location.x, 1237 + offset, 10, colors["module-text"], "center");
        rectangle(context, location.x - 6, 1179 + offset, 12, 6, 2, colors["led-off"]);
        context.globalAlpha = state.visual.leds["K" + index];
        rectangle(context, location.x - 6, 1179 + offset, 12, 6, 2, colors["led-on"]);
        context.globalAlpha = 1;
    }
    for (const name of ["P+", "P-"]) {
        const location = endpointPosition(name);
        label(context, name, location.x, 1156 + offset, 10, colors["module-text"], "center");
        circle(context, location.x, 1208 + offset, 14, colors["chip-text"]);
        label(context, "脉冲", location.x, 1237 + offset, 9, colors["module-text"], "center");
    }
    for (const name of ["GND", "VCC"]) {
        const location = endpointPosition(name);
        circle(context, location.x, location.y, 5, colors.metal);
        label(context, name, location.x, 1195 + offset, 9, colors.ink, "center");
    }
    for (let index = 0; index < 24; index = index + 1) {
        for (const prefix of ["K", "L"]) {
            const location = endpointPosition(prefix + index);
            circle(context, location.x, location.y, 4.5, colors.metal);
            circle(context, location.x, location.y, 2.5, colors.hole);
        }
    }
    for (const name of ["P+", "P-"]) {
        const location = endpointPosition(name);
        circle(context, location.x, location.y, 4.5, colors.metal);
        circle(context, location.x, location.y, 2.5, colors.hole);
    }
}

// 绘制芯片的封装、缺口、引脚和脚号。
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

// 绘制导线，选中的线加粗；端点圆圈与普通交叉区分。
function drawWires(context, state, colors) {
    for (let index = 0; index < state.project.wires.length; index = index + 1) {
        const wire = state.project.wires[index];
        const points = wirePoints(wire, index);
        let width = DRAW.wireWidth;
        const selected = objectSelected(state, "wire", wire.id);
        if (selected) {
            width = 5;
        }
        polyline(context, points, colors.surface, width + 2);
        polyline(context, points, wire.color, width);
        const first = points[0];
        const last = points[points.length - 1];
        circle(context, first.x, first.y, 4, wire.color);
        circle(context, last.x, last.y, 4, wire.color);
        if (selected && state.tool === "select") {
            for (const point of points) {
                rectangle(context, point.x - 5, point.y - 5, 10, 10, 2, colors.surface);
                context.strokeStyle = wire.color;
                context.lineWidth = 2;
                context.strokeRect(point.x - 5, point.y - 5, 10, 10);
            }
        }
    }
    if (state.pending) {
        const points = [endpointPosition(state.pending.from)];
        for (const bend of state.pending.bends) {
            points.push(bend);
        }
        if (state.pointer) {
            points.push(state.pointer);
        }
        context.setLineDash([6, 4]);
        polyline(context, points, state.wireColor, 2.5);
        context.setLineDash([]);
    }
}

// 绘制选中节点的同组孔高亮，以及可选的节点电平。
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
        if (state.showLevels) {
            const value = readEndpoint(state.result, name);
            if (value !== "Z") {
                let color = colors.unknown;
                if (value === 0) {
                    color = colors.ink;
                } else if (value === 1) {
                    color = colors.success;
                }
                circle(context, location.x, location.y, 3.2, color);
            }
        }
    }
    if (state.hovered) {
        const location = endpointPosition(state.hovered);
        context.strokeStyle = colors.accent;
        context.lineWidth = 2;
        context.strokeRect(location.x - 8, location.y - 8, 16, 16);
    }
}

// 重绘整个面包板，参数为画布、界面状态和所有可连接端点。
export function renderBoard(canvas, state, endpoints) {
    const context = canvas.getContext("2d");
    context.setTransform(2, 0, 0, 2, 0, 0);
    const colors = canvasColors();
    context.clearRect(0, 0, BOARD.width, BOARD.height);
    rectangle(context, 0, 0, BOARD.width, BOARD.height, 8, colors.board);
    drawBreadboards(context, state, colors);
    drawModules(context, state, colors);
    for (const chip of state.project.chips) {
        drawChip(context, chip, state, colors);
    }
    drawWires(context, state, colors);
    drawHighlights(context, state, endpoints, colors);
    if (state.placing) {
        label(context, "放置 " + state.placing, 650, 1105, 17, colors.accent, "center");
    }
}

// 计算点到线段的距离，供导线选择使用。
function segmentDistance(point, first, last) {
    const horizontal = last.x - first.x;
    const vertical = last.y - first.y;
    const length = horizontal * horizontal + vertical * vertical;
    if (length === 0) {
        return Math.hypot(point.x - first.x, point.y - first.y);
    }
    let portion = ((point.x - first.x) * horizontal + (point.y - first.y) * vertical) / length;
    portion = Math.max(0, Math.min(1, portion));
    return Math.hypot(point.x - first.x - portion * horizontal, point.y - first.y - portion * vertical);
}

// 判断鼠标位置命中了按键、孔、芯片或导线，返回对象或空值。
export function hitCandidates(point, state, endpoints) {
    const candidates = [];
    if (point.y >= PORT_LAYOUT.inputY + 17 && point.y <= PORT_LAYOUT.inputY + 60) {
        for (let index = 0; index < 24; index = index + 1) {
            const location = endpointPosition("K" + index);
            if (Math.abs(point.x - location.x) <= 15) {
                return [{ kind: "switch", id: index }];
            }
        }
        for (const name of ["P+", "P-"]) {
            const location = endpointPosition(name);
            if (Math.abs(point.x - location.x) <= 16) {
                return [{ kind: "pulse", id: name }];
            }
        }
    }
    // 导线先参与命中，避免接口或芯片把重叠导线挡住。
    for (let index = state.project.wires.length - 1; index >= 0; index = index - 1) {
        const wire = state.project.wires[index];
        const points = wirePoints(wire, index);
        for (let segment = 1; segment < points.length; segment = segment + 1) {
            if (segmentDistance(point, points[segment - 1], points[segment]) < 5) {
                candidates.push({ kind: "wire", id: wire.id });
                break;
            }
        }
    }
    for (const name of endpoints) {
        const location = endpointPosition(name);
        if (Math.hypot(point.x - location.x, point.y - location.y) <= DRAW.pickRadius) {
            candidates.push({ kind: "node", id: name });
        }
    }
    for (const chip of state.project.chips) {
        const bounds = chipBounds(chip);
        if (point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height) {
            candidates.push({ kind: "chip", id: chip.id });
        }
    }
    return candidates;
}

// 返回最上层可选择对象，悬停和普通命中沿用这个入口。
export function hitTest(point, state, endpoints) {
    const candidates = hitCandidates(point, state, endpoints);
    if (candidates.length > 0) {
        return candidates[0];
    }
    return null;
}

// 判断对象是否包含在 Ctrl 多选列表中。
export function objectSelected(state, kind, id) {
    if (state.selection && state.selection.length > 0) {
        for (const target of state.selection) {
            if (target.kind === kind && target.id === id) {
                return true;
            }
        }
        return false;
    }
    return Boolean(state.selected && state.selected.kind === kind && state.selected.id === id);
}

// 找到拖动落点附近的真实插孔，返回孔名或空字符串。
export function nearestEndpoint(point, endpoints) {
    let nearest = "";
    let distance = 14;
    for (const name of endpoints) {
        const location = endpointPosition(name);
        const current = Math.hypot(point.x - location.x, point.y - location.y);
        if (current < distance) {
            distance = current;
            nearest = name;
        }
    }
    return nearest;
}

// 返回所选导线靠近鼠标的端点或转折点，用于拖动而不是新增接线。
export function wireHandleAt(point, project, selected) {
    if (!selected || selected.kind !== "wire") {
        return null;
    }
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        if (wire.id !== selected.id) {
            continue;
        }
        const points = wirePoints(wire, index);
        for (let handle = 0; handle < points.length; handle = handle + 1) {
            if (Math.hypot(point.x - points[handle].x, point.y - points[handle].y) <= 9) {
                return { wire: wire.id, handle: handle, points: points };
            }
        }
    }
    return null;
}
