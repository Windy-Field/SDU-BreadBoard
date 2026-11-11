import { chipBounds, wirePoints } from "../src/geometry.mjs";
import { segmentCrossesBounds } from "../src/wire-path.mjs";

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

// 计算两条同方向线段重合的长度，支持水平、竖直和斜线
function sharedLength(first, second) {
    const horizontal = first.first.y === first.last.y && second.first.y === second.last.y;
    if (horizontal && first.first.y === second.first.y) {
        return intervalOverlap(first.first.x, first.last.x, second.first.x, second.last.x);
    }
    const vertical = first.first.x === first.last.x && second.first.x === second.last.x;
    if (vertical && first.first.x === second.first.x) {
        return intervalOverlap(first.first.y, first.last.y, second.first.y, second.last.y);
    }
    const horizontalChange = first.last.x - first.first.x;
    const verticalChange = first.last.y - first.first.y;
    const secondHorizontal = second.last.x - second.first.x;
    const secondVertical = second.last.y - second.first.y;
    const parallel = horizontalChange * secondVertical === verticalChange * secondHorizontal;
    const sameLine = horizontalChange * (second.first.y - first.first.y) === verticalChange * (second.first.x - first.first.x);
    if (horizontalChange !== 0 && verticalChange !== 0 && parallel && sameLine) {
        const overlap = intervalOverlap(first.first.x, first.last.x, second.first.x, second.last.x);
        return overlap * Math.hypot(horizontalChange, verticalChange) / Math.abs(horizontalChange);
    }
    return 0;
}

// 检查任意方向的线段是否穿过芯片外框，贴边不算穿过
function crossesChip(segment, chip) {
    return segmentCrossesBounds(segment.first, segment.last, chipBounds(chip));
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
