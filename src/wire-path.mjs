import { BOARD } from "./board.mjs";

// 斜角横纵各最多一个孔距，实际斜线长度最多为孔距乘以根号二
export const WIRE_PATH = { tolerance: 0.000001, cornerSize: BOARD.pitch, cornerPortion: 1 / 3 };

// 去掉重复点及同向直线上的中间点，返回新的路径，不修改传入坐标
export function simplifyWirePath(points) {
    const result = [];
    for (const point of points) {
        const previous = result[result.length - 1];
        if (previous && previous.x === point.x && previous.y === point.y) {
            continue;
        }
        while (result.length >= 2) {
            const last = result[result.length - 1];
            const before = result[result.length - 2];
            const firstHorizontal = last.x - before.x;
            const firstVertical = last.y - before.y;
            const nextHorizontal = point.x - last.x;
            const nextVertical = point.y - last.y;
            const cross = firstHorizontal * nextVertical - firstVertical * nextHorizontal;
            const direction = firstHorizontal * nextHorizontal + firstVertical * nextVertical;
            if (Math.abs(cross) > WIRE_PATH.tolerance || direction <= 0) {
                break;
            }
            result.pop();
        }
        result.push({ x: point.x, y: point.y });
    }
    return result;
}

// 将长斜线改成横竖主路径和短斜角，保留指定节点与已经合规的线段
export function angleWirePath(points) {
    if (points.length === 0) {
        return [];
    }
    const result = [points[0]];
    for (let index = 1; index < points.length; index = index + 1) {
        const first = points[index - 1];
        const last = points[index];
        const horizontal = last.x - first.x;
        const vertical = last.y - first.y;
        if (horizontal !== 0 && vertical !== 0) {
            const diagonal = Math.abs(Math.abs(horizontal) - Math.abs(vertical)) <= WIRE_PATH.tolerance;
            if (!diagonal || Math.abs(horizontal) > WIRE_PATH.cornerSize + WIRE_PATH.tolerance) {
                const corner = { x: last.x, y: first.y };
                const section = shortCornerPath([first, corner, last], [], Infinity);
                for (let position = 1; position < section.length - 1; position = position + 1) {
                    result.push(section[position]);
                }
            }
        }
        result.push(last);
    }
    return simplifyWirePath(result);
}

// 将横竖路径的直角改成短斜角，保护端点、芯片避让区和允许的路径点数
export function shortCornerPath(points, obstacles, maximumPoints) {
    const result = [];
    for (let index = 0; index < points.length; index = index + 1) {
        const corner = points[index];
        if (index === 0 || index === points.length - 1) {
            result.push(corner);
            continue;
        }
        const before = points[index - 1];
        const after = points[index + 1];
        const incomingX = corner.x - before.x;
        const incomingY = corner.y - before.y;
        const outgoingX = after.x - corner.x;
        const outgoingY = after.y - corner.y;
        const incomingAxis = incomingX === 0 || incomingY === 0;
        const outgoingAxis = outgoingX === 0 || outgoingY === 0;
        const perpendicular = incomingX * outgoingX + incomingY * outgoingY === 0;
        const remaining = points.length - index - 1;
        if (!incomingAxis || !outgoingAxis || !perpendicular || result.length + remaining + 2 > maximumPoints) {
            result.push(corner);
            continue;
        }
        // 每个转角最多占相邻线段的三分之一，避免相邻斜角合并成长斜线
        const incomingLength = Math.hypot(incomingX, incomingY);
        const outgoingLength = Math.hypot(outgoingX, outgoingY);
        const size = Math.min(WIRE_PATH.cornerSize, incomingLength * WIRE_PATH.cornerPortion, outgoingLength * WIRE_PATH.cornerPortion);
        if (size <= WIRE_PATH.tolerance) {
            result.push(corner);
            continue;
        }
        const first = { x: corner.x - Math.sign(incomingX) * size, y: corner.y - Math.sign(incomingY) * size };
        const last = { x: corner.x + Math.sign(outgoingX) * size, y: corner.y + Math.sign(outgoingY) * size };
        let blocked = false;
        for (const obstacle of obstacles) {
            if (segmentCrossesBounds(first, last, obstacle)) {
                blocked = true;
                break;
            }
        }
        if (blocked) {
            result.push(corner);
        } else {
            result.push(first, last);
        }
    }
    return simplifyWirePath(result);
}

// 判断线段是否进入矩形内部，边界上的接触不算穿过，用于保护芯片外框
export function segmentCrossesBounds(first, last, bounds) {
    let enter = 0;
    let leave = 1;
    const starts = [first.x, first.y];
    const changes = [last.x - first.x, last.y - first.y];
    const minimums = [bounds.x + WIRE_PATH.tolerance, bounds.y + WIRE_PATH.tolerance];
    const maximums = [bounds.x + bounds.width - WIRE_PATH.tolerance, bounds.y + bounds.height - WIRE_PATH.tolerance];
    // 分别求横向、纵向位于矩形内部的区间，两者重叠才会穿过
    for (let axis = 0; axis < 2; axis = axis + 1) {
        const start = starts[axis];
        const change = changes[axis];
        if (Math.abs(change) <= WIRE_PATH.tolerance) {
            if (start < minimums[axis] || start > maximums[axis]) {
                return false;
            }
        } else {
            const firstPortion = (minimums[axis] - start) / change;
            const lastPortion = (maximums[axis] - start) / change;
            enter = Math.max(enter, Math.min(firstPortion, lastPortion));
            leave = Math.min(leave, Math.max(firstPortion, lastPortion));
            if (enter >= leave) {
                return false;
            }
        }
    }
    return enter < leave;
}

