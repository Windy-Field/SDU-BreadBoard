// 路径坐标比较容差，单位为画布逻辑像素
export const WIRE_PATH = { tolerance: 0.000001 };

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

// 在指定点之间补上横线或竖线，使每段只包含水平、竖直和 45° 方向
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
        const distance = Math.min(Math.abs(horizontal), Math.abs(vertical));
        if (distance > 0 && Math.abs(horizontal) !== Math.abs(vertical)) {
            const diagonalEnd = {
                x: first.x + Math.sign(horizontal) * distance,
                y: first.y + Math.sign(vertical) * distance
            };
            result.push(diagonalEnd);
        }
        result.push(last);
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

