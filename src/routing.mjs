import { BOARD, endpointPosition } from "./board.mjs";
import { chipBounds } from "./geometry.mjs";
import { LIMITS } from "./storage.mjs";
import { simplifyWirePath } from "./wire-path.mjs";
import { findRoute, routeSegments } from "./routing-graph.mjs";

// 芯片周围留出的距离和画布边界，单位为画布逻辑像素
const ROUTING = { margin: 6, sideMargin: 24, topBoundary: 62, bottomBoundary: 1110 };

// 短线先整理，长度相同时按原顺序处理，保证重复整理得到相同结果
function compareLength(first, second) {
    return first.length - second.length;
}

// 把执行权交还浏览器，让较大的电路在整理过程中仍能刷新界面
function yieldRouting(resolve) {
    setTimeout(resolve, 0);
}

// 将芯片外框扩大为避让区，端点和其他物理孔位不移动
function routingObstacles(project) {
    const obstacles = [];
    for (const chip of project.chips) {
        const bounds = chipBounds(chip);
        obstacles.push({ x: bounds.x - ROUTING.margin, y: bounds.y - ROUTING.margin, width: bounds.width + ROUTING.margin * 2, height: bounds.height + ROUTING.margin * 2 });
    }
    return obstacles;
}

// 为电路生成路径表，先减少拐角，再比较重叠和长度，angle 为 45 时允许斜线
export async function routeWires(project, angle) {
    const obstacles = routingObstacles(project);
    const occupied = [];
    const ordered = [];
    for (const wire of project.wires) {
        const first = endpointPosition(wire.from);
        const last = endpointPosition(wire.to);
        const length = Math.hypot(first.x - last.x, first.y - last.y);
        ordered.push({ wire: wire, first: first, last: last, length: length });
    }
    ordered.sort(compareLength);
    const routes = {};
    for (const entry of ordered) {
        const boundary = { x: ROUTING.sideMargin, y: Math.min(ROUTING.topBoundary, entry.first.y, entry.last.y), right: BOARD.width - ROUTING.sideMargin, bottom: Math.max(ROUTING.bottomBoundary, entry.first.y, entry.last.y) };
        const path = findRoute(entry.first, entry.last, obstacles, occupied, boundary, angle);
        if (path.length === 0) {
            throw new Error("找不到导线路径：" + entry.wire.id);
        }
        const simplified = simplifyWirePath(path);
        const bends = simplified.slice(1, -1);
        // 直线保留中点，避免空转折点触发画布原有的默认折线
        if (bends.length === 0) {
            bends.push({ x: (entry.first.x + entry.last.x) / 2, y: (entry.first.y + entry.last.y) / 2 });
        }
        if (bends.length > LIMITS.bends) {
            throw new Error("导线路径拐角过多：" + entry.wire.id);
        }
        routes[entry.wire.id] = bends;
        for (const segment of routeSegments(simplified)) {
            occupied.push(segment);
        }
        await new Promise(yieldRouting);
    }
    return routes;
}
