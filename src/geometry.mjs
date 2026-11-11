import { BOARD, PORT_LAYOUT, IO_LIMIT, endpointPosition, rowY } from "./board.mjs";
import { CHIP_MODELS } from "./chips.mjs";

// 鼠标命中和拖动吸附范围，单位为画布逻辑像素
const PICK = { nodeRadius: 7, wireRadius: 5, endpointRadius: 14, handleRadius: 9, switchHalfWidth: 15, pulseHalfWidth: 16, buttonTop: 17, buttonBottom: 60 };
// 默认折线的通道间隔与同排判断距离，手动转折点不使用这些参数
const WIRE_LAYOUT = { laneStart: 12, laneCount: 9, laneStep: 5, sameRowDistance: 12 };
// 芯片外壳相对引脚的位置与高度，绘制和点击共用
const CHIP_LAYOUT = { leftOffset: 9, topOffset: 9, height: 32 };
// 返回芯片在画布中的外框，用于绘制和鼠标选择
export function chipBounds(chip) {
    const count = CHIP_MODELS[chip.model].count;
    const left = BOARD.startX + (chip.column - 1) * BOARD.pitch - CHIP_LAYOUT.leftOffset;
    const top = rowY(chip.section, "E") + CHIP_LAYOUT.topOffset;
    return { x: left, y: top, width: count / 2 * BOARD.pitch, height: CHIP_LAYOUT.height };
}

// 返回一根导线的折线点；有手动转折点时保留原路径
export function wirePoints(wire, index) {
    const first = endpointPosition(wire.from);
    const last = endpointPosition(wire.to);
    const points = [first];
    if (wire.bends.length > 0) {
        for (const bend of wire.bends) {
            points.push(bend);
        }
    } else {
        const laneOffset = WIRE_LAYOUT.laneStart + (index % WIRE_LAYOUT.laneCount) * WIRE_LAYOUT.laneStep;
        let lane = (first.y + last.y) / 2 + laneOffset;
        if (Math.abs(first.y - last.y) < WIRE_LAYOUT.sameRowDistance) {
            lane = first.y - laneOffset;
        }
        points.push({ x: first.x, y: lane });
        points.push({ x: last.x, y: lane });
    }
    points.push(last);
    return points;
}

// 计算点到线段的距离，供导线选择使用
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

// 判断鼠标位置命中了按键、孔、芯片或导线，返回对象或空值
export function hitCandidates(point, state, endpoints) {
    const candidates = [];
    if (point.y >= PORT_LAYOUT.inputY + PICK.buttonTop && point.y <= PORT_LAYOUT.inputY + PICK.buttonBottom) {
        for (let index = 0; index < IO_LIMIT; index = index + 1) {
            const location = endpointPosition("K" + index);
            if (Math.abs(point.x - location.x) <= PICK.switchHalfWidth) {
                return [{ kind: "switch", id: index }];
            }
        }
        for (const name of ["P+", "P-"]) {
            const location = endpointPosition(name);
            if (Math.abs(point.x - location.x) <= PICK.pulseHalfWidth) {
                return [{ kind: "pulse", id: name }];
            }
        }
    }
    // 导线先参与命中，避免接口或芯片把重叠导线挡住
    for (let index = state.project.wires.length - 1; index >= 0; index = index - 1) {
        const wire = state.project.wires[index];
        const points = wirePoints(wire, index);
        for (let segment = 1; segment < points.length; segment = segment + 1) {
            if (segmentDistance(point, points[segment - 1], points[segment]) < PICK.wireRadius) {
                candidates.push({ kind: "wire", id: wire.id });
                break;
            }
        }
    }
    for (const name of endpoints) {
        const location = endpointPosition(name);
        if (Math.hypot(point.x - location.x, point.y - location.y) <= PICK.nodeRadius) {
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

// 返回最上层可选择对象，悬停和普通命中沿用这个入口
export function hitTest(point, state, endpoints) {
    const candidates = hitCandidates(point, state, endpoints);
    if (candidates.length > 0) {
        return candidates[0];
    }
    return null;
}

// 判断对象是否包含在 Ctrl 多选列表中
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

// 找到拖动落点附近的真实插孔，返回孔名或空字符串
export function nearestEndpoint(point, endpoints) {
    let nearest = "";
    let distance = PICK.endpointRadius;
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

// 返回所选导线靠近鼠标的端点或转折点，用于拖动而不是新增接线
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
            if (Math.hypot(point.x - points[handle].x, point.y - points[handle].y) <= PICK.handleRadius) {
                return { wire: wire.id, handle: handle, points: points };
            }
        }
    }
    return null;
}
