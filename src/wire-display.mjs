// 屏幕上重叠线的错开距离和最大档数，只改变显示坐标
const DISPLAY_SPACING = { gap: 4, lanes: 1 };

// 计算同一路径的显示偏移，不改变保存的导线坐标或电气连接
function segmentOffset(first, last, wireIndex, paths) {
    const horizontal = first.y === last.y;
    const vertical = first.x === last.x;
    if (!horizontal && !vertical) {
        return 0;
    }
    let overlaps = 0;
    for (let otherIndex = 0; otherIndex < wireIndex; otherIndex = otherIndex + 1) {
        const otherPoints = paths[otherIndex];
        for (let otherSegment = 1; otherSegment < otherPoints.length; otherSegment = otherSegment + 1) {
            const otherFirst = otherPoints[otherSegment - 1];
            const otherLast = otherPoints[otherSegment];
            if (horizontal && otherFirst.y === otherLast.y && first.y === otherFirst.y) {
                const shared = sharedLength(first.x, last.x, otherFirst.x, otherLast.x);
                if (shared > 0) {
                    overlaps = overlaps + 1;
                }
            }
            if (vertical && otherFirst.x === otherLast.x && first.x === otherFirst.x) {
                const shared = sharedLength(first.y, last.y, otherFirst.y, otherLast.y);
                if (shared > 0) {
                    overlaps = overlaps + 1;
                }
            }
        }
    }
    if (overlaps === 0) {
        return 0;
    }
    const lane = Math.floor((overlaps + 1) / 2) % DISPLAY_SPACING.lanes + 1;
    let direction = 1;
    if (overlaps % 2 === 1) {
        direction = -1;
    }
    const distance = lane * DISPLAY_SPACING.gap;
    if (horizontal) {
        return direction * distance;
    }
    return direction * distance;
}

// 返回两个坐标区间的重叠长度，用于识别显示时互相遮住的线段
function sharedLength(firstStart, firstEnd, secondStart, secondEnd) {
    const low = Math.max(Math.min(firstStart, firstEnd), Math.min(secondStart, secondEnd));
    const high = Math.min(Math.max(firstStart, firstEnd), Math.max(secondStart, secondEnd));
    return Math.max(0, high - low);
}

// 返回用于绘制和命中的显示路径；保存与仿真仍使用原来的线段坐标
export function wireDisplayPoints(points, index, paths) {
    const result = [];
    for (let segment = 1; segment < points.length; segment = segment + 1) {
        const first = points[segment - 1];
        const last = points[segment];
        const offset = segmentOffset(first, last, index, paths);
        let displayFirst = { x: first.x, y: first.y };
        let displayLast = { x: last.x, y: last.y };
        if (first.y === last.y) {
            displayFirst.y = displayFirst.y + offset;
            displayLast.y = displayLast.y + offset;
        } else if (first.x === last.x) {
            displayFirst.x = displayFirst.x + offset;
            displayLast.x = displayLast.x + offset;
        }
        if (result.length === 0) {
            result.push({ x: first.x, y: first.y });
        }
        const previous = result[result.length - 1];
        if (previous.x !== displayFirst.x || previous.y !== displayFirst.y) {
            result.push(displayFirst);
        }
        result.push(displayLast);
    }
    const last = points[points.length - 1];
    const displayLast = result[result.length - 1];
    if (displayLast && (displayLast.x !== last.x || displayLast.y !== last.y)) {
        result.push({ x: last.x, y: last.y });
    }
    return result;
}
