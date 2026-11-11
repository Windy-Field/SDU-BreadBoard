import { chipBounds, wirePoints } from "../src/geometry.mjs";

// 将电路折线拆成线段，记录所属导线，便于比较路径是否挤在一起
function wireSegments(project) {
    const segments = [];
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        const points = wirePoints(wire, index);
        for (let position = 1; position < points.length; position = position + 1) {
            const first = points[position - 1];
            const last = points[position];
            if (first.x === last.x && first.y === last.y) {
                continue;
            }
            segments.push({ wire: wire.id, first: first, last: last });
        }
    }
    return segments;
}

// 计算两个线段区间共有的长度，交叉一点不算共线重叠
function intervalOverlap(firstStart, firstEnd, secondStart, secondEnd) {
    const start = Math.max(Math.min(firstStart, firstEnd), Math.min(secondStart, secondEnd));
    const end = Math.min(Math.max(firstStart, firstEnd), Math.max(secondStart, secondEnd));
    return Math.max(0, end - start);
}

// 计算两条水平或竖直线段重合的长度，不同方向返回零
function sharedLength(first, second) {
    const horizontal = first.first.y === first.last.y && second.first.y === second.last.y;
    if (horizontal && first.first.y === second.first.y) {
        return intervalOverlap(first.first.x, first.last.x, second.first.x, second.last.x);
    }
    const vertical = first.first.x === first.last.x && second.first.x === second.last.x;
    if (vertical && first.first.x === second.first.x) {
        return intervalOverlap(first.first.y, first.last.y, second.first.y, second.last.y);
    }
    return 0;
}

// 判断一条正交线段是否穿过芯片文字所在的外框内部，贴边不算穿过
function crossesChip(segment, chip) {
    const bounds = chipBounds(chip);
    if (segment.first.y === segment.last.y) {
        const inside = segment.first.y > bounds.y && segment.first.y < bounds.y + bounds.height;
        const length = intervalOverlap(segment.first.x, segment.last.x, bounds.x, bounds.x + bounds.width);
        return inside && length > 0;
    }
    const inside = segment.first.x > bounds.x && segment.first.x < bounds.x + bounds.width;
    const length = intervalOverlap(segment.first.y, segment.last.y, bounds.y, bounds.y + bounds.height);
    return inside && length > 0;
}

// 返回共线重叠总长度和穿过芯片的线段数，只衡量显示路径，不判断电气连接
export function wiringMetrics(project) {
    const segments = wireSegments(project);
    let overlap = 0;
    let chipCrossings = 0;
    for (let first = 0; first < segments.length; first = first + 1) {
        const segment = segments[first];
        for (const chip of project.chips) {
            if (crossesChip(segment, chip)) {
                chipCrossings = chipCrossings + 1;
            }
        }
        for (let second = first + 1; second < segments.length; second = second + 1) {
            if (segment.wire !== segments[second].wire) {
                overlap = overlap + sharedLength(segment, segments[second]);
            }
        }
    }
    return { overlap: overlap, chipCrossings: chipCrossings };
}
