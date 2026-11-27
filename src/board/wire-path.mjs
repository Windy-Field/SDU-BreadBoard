import { BOARD } from "./board.mjs";

// 斜角横纵各最多一个孔距，实际斜线长度最多为孔距乘以根号二
export const WIRE_PATH = { tolerance: 0.000001, cornerSize: BOARD.pitch, cornerPortion: 1 / 3 };
// 小错位最多三分之一个列距，转弯可在原位置附近寻找空位
const END_ALIGNMENT = { maximumOffset: BOARD.pitch / 3, laneStep: BOARD.rowPitch / 2, laneSteps: 6 };

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

// 判断两个坐标是否只差计算误差，保留布线引擎给出的有效小数
function sameCoordinate(first, last) {
    return Math.abs(first - last) <= WIRE_PATH.tolerance;
}

// 判断短折线是不是竖向长线旁的小横移，返回横移末点的下标
function firstSideStep(points) {
    for (let index = 1; index <= 2 && index + 1 < points.length; index = index + 1) {
        const start = points[index - 1];
        const bend = points[index];
        const next = points[index + 1];
        const offset = Math.abs(start.x - bend.x);
        if (sameCoordinate(start.y, bend.y) && offset > WIRE_PATH.tolerance && offset <= END_ALIGNMENT.maximumOffset) {
            if (sameCoordinate(bend.x, next.x) && Math.abs(bend.y - next.y) > BOARD.rowPitch) {
                return index;
            }
        }
        if (!sameCoordinate(start.x, bend.x)) {
            break;
        }
    }
    return 0;
}

// 返回两段共线横线或竖线的重合长度，其他情况返回零
function orthogonalOverlap(first, last, otherFirst, otherLast) {
    if (sameCoordinate(first.x, last.x) && sameCoordinate(first.x, otherFirst.x) && sameCoordinate(first.x, otherLast.x)) {
        const top = Math.max(Math.min(first.y, last.y), Math.min(otherFirst.y, otherLast.y));
        const bottom = Math.min(Math.max(first.y, last.y), Math.max(otherFirst.y, otherLast.y));
        return Math.max(0, bottom - top);
    }
    if (sameCoordinate(first.y, last.y) && sameCoordinate(first.y, otherFirst.y) && sameCoordinate(first.y, otherLast.y)) {
        const left = Math.max(Math.min(first.x, last.x), Math.min(otherFirst.x, otherLast.x));
        const right = Math.min(Math.max(first.x, last.x), Math.max(otherFirst.x, otherLast.x));
        return Math.max(0, right - left);
    }
    return 0;
}

// 检查更新后的端部，确认它没有穿过芯片或压住其他导线
function clearWireTurn(lead, paths, wireIndex, obstacles, sharedHoles) {
    for (let index = 1; index < lead.length; index = index + 1) {
        for (const obstacle of obstacles) {
            if (segmentCrossesBounds(lead[index - 1], lead[index], obstacle)) {
                return false;
            }
        }
    }
    for (let index = 0; index < paths.length; index = index + 1) {
        if (index === wireIndex) {
            continue;
        }
        const other = paths[index];
        let allowedOverlap = WIRE_PATH.tolerance;
        if (sharedHoles.has(index)) {
            // 同一铜排上的相邻插孔可以共用一小段线，长度最多一个行距
            allowedOverlap = BOARD.rowPitch;
        }
        for (let point = 1; point < other.length; point = point + 1) {
            for (let segment = 1; segment < lead.length; segment = segment + 1) {
                const overlap = orthogonalOverlap(lead[segment - 1], lead[segment], other[point - 1], other[point]);
                if (overlap > allowedOverlap) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 让整段竖线贴齐孔列，必要时移动与它相连的横向转弯
function straightenFirstTurn(points, paths, wireIndex, obstacles, sharedHoles) {
    const step = firstSideStep(points);
    if (step === 0 || step + 2 >= points.length) {
        return points;
    }
    const hole = points[0];
    const corner = points[step + 1];
    const across = points[step + 2];
    if (!sameCoordinate(corner.y, across.y)) {
        return points;
    }
    const next = points[step + 3];
    if (!next && sameCoordinate(hole.x, across.x)) {
        const direct = [hole, across];
        if (clearWireTurn(direct, paths, wireIndex, obstacles, sharedHoles)) {
            return direct;
        }
        return points;
    }
    if (next && !sameCoordinate(across.x, next.x)) {
        return points;
    }

    // 先试原来的转弯位置，再逐步向两侧寻找近处的空位
    for (let distance = 0; distance <= END_ALIGNMENT.laneSteps; distance = distance + 1) {
        for (const direction of [1, -1]) {
            if (distance === 0 && direction < 0) {
                continue;
            }
            const turnY = corner.y + distance * direction * END_ALIGNMENT.laneStep;
            if (turnY < 0 || turnY > BOARD.height || (turnY - hole.y) * (corner.y - hole.y) <= 0) {
                continue;
            }
            if (!next && distance > 0) {
                continue;
            }
            if (next && step + 3 < points.length - 1 && (next.y - turnY) * (next.y - across.y) < 0) {
                continue;
            }
            const lead = [hole, { x: hole.x, y: turnY }, { x: across.x, y: turnY }];
            const tail = points.slice(step + 3);
            const changed = lead.concat(tail);
            const check = changed.slice(0, 4);
            if (clearWireTurn(check, paths, wireIndex, obstacles, sharedHoles)) {
                return simplifyWirePath(changed);
            }
        }
    }
    return points;
}

// 分别检查导线两端，使用同一批路径避开已经占用的通道
export function straightenWireEnds(points, paths, wireIndex, obstacles, sharedHoles) {
    const first = straightenFirstTurn(points, paths, wireIndex, obstacles, sharedHoles);
    const reversed = first.slice();
    reversed.reverse();
    const last = straightenFirstTurn(reversed, paths, wireIndex, obstacles, sharedHoles);
    if (last === reversed) {
        return first;
    }
    last.reverse();
    return last;
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

