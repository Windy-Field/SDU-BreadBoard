import pathfinding from "javascript-astar";
import { segmentCrossesBounds, simplifyWirePath, WIRE_PATH } from "./wire-path.mjs";

// 拐角数相同时的比较参数：重叠、贴线和交叉的代价高于同长度的空闲路径
const ROUTE_COST = { overlap: 70, nearby: 3, crossing: 10, clearance: 6, coordinateDigits: 6 };
// 直线方向固定排序，保证相同输入生成相同的走线
const DIRECTIONS = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];

// 将路径拆成线段，供后续线路比较重叠和交叉
export function routeSegments(points) {
    const result = [];
    for (let index = 1; index < points.length; index = index + 1) {
        result.push({ first: points[index - 1], last: points[index] });
    }
    return result;
}

// 返回两个数值区间的重叠长度，单点接触的长度为零
function sharedInterval(firstStart, firstEnd, lastStart, lastEnd) {
    const start = Math.max(Math.min(firstStart, firstEnd), Math.min(lastStart, lastEnd));
    const end = Math.min(Math.max(firstStart, firstEnd), Math.max(lastStart, lastEnd));
    return Math.max(0, end - start);
}

// 计算一段线路与已有线段的重叠、贴线和内部交叉代价
function segmentCost(first, last, occupied) {
    const horizontal = last.x - first.x;
    const vertical = last.y - first.y;
    const length = Math.hypot(horizontal, vertical);
    if (length === 0) {
        return 0;
    }
    const directionX = horizontal / length;
    const directionY = vertical / length;
    let cost = length;
    for (const segment of occupied) {
        const otherX = segment.last.x - segment.first.x;
        const otherY = segment.last.y - segment.first.y;
        const offsetX = segment.first.x - first.x;
        const offsetY = segment.first.y - first.y;
        const cross = directionX * otherY - directionY * otherX;
        if (Math.abs(cross) <= WIRE_PATH.tolerance) {
            const distance = Math.abs(offsetX * directionY - offsetY * directionX);
            const start = offsetX * directionX + offsetY * directionY;
            const end = start + otherX * directionX + otherY * directionY;
            const overlap = sharedInterval(0, length, start, end);
            if (distance <= WIRE_PATH.tolerance) {
                cost = cost + overlap * ROUTE_COST.overlap;
            } else if (distance < ROUTE_COST.clearance) {
                cost = cost + overlap * ROUTE_COST.nearby;
            }
        } else {
            const distance = (offsetX * otherY - offsetY * otherX) / cross;
            const portion = (offsetX * directionY - offsetY * directionX) / cross;
            if (distance > WIRE_PATH.tolerance && distance < length - WIRE_PATH.tolerance && portion > 0 && portion < 1) {
                cost = cost + ROUTE_COST.crossing;
            }
        }
    }
    return cost;
}

// 检查直线方向是否合法，返回固定方向编号，不合法时返回 -1
function lineDirection(first, last) {
    const horizontal = last.x - first.x;
    const vertical = last.y - first.y;
    if (horizontal === 0 && vertical === 0) {
        return -1;
    }
    if (horizontal !== 0 && vertical !== 0) {
        return -1;
    }
    for (let index = 0; index < DIRECTIONS.length; index = index + 1) {
        const direction = DIRECTIONS[index];
        if (Math.sign(horizontal) === direction.x && Math.sign(vertical) === direction.y) {
            return index;
        }
    }
    return -1;
}

// 判断整条候选路径是否保持在画布内并避开芯片
function allowedPath(points, obstacles, boundary) {
    for (const point of points) {
        if (point.x < boundary.x || point.x > boundary.right || point.y < boundary.y || point.y > boundary.bottom) {
            return false;
        }
    }
    for (const segment of routeSegments(points)) {
        for (const obstacle of obstacles) {
            if (segmentCrossesBounds(segment.first, segment.last, obstacle)) {
                return false;
            }
        }
    }
    return true;
}

// 直接线和单拐角路径可以穷举，先解决这些线路，避免不必要的整图搜索
function simpleRoute(first, last, obstacles, occupied, boundary) {
    if (lineDirection(first, last) >= 0 && allowedPath([first, last], obstacles, boundary)) {
        return [first, last];
    }
    let best = [];
    let bestCost = Infinity;
    const count = DIRECTIONS.length;
    for (let incoming = 0; incoming < count; incoming = incoming + 1) {
        for (let outgoing = 0; outgoing < count; outgoing = outgoing + 1) {
            const start = DIRECTIONS[incoming];
            const end = DIRECTIONS[outgoing];
            const determinant = start.x * end.y - start.y * end.x;
            if (determinant === 0) {
                continue;
            }
            const horizontal = last.x - first.x;
            const vertical = last.y - first.y;
            const distance = (horizontal * end.y - vertical * end.x) / determinant;
            const corner = { x: first.x + start.x * distance, y: first.y + start.y * distance };
            const path = simplifyWirePath([first, corner, last]);
            if (!allowedPath(path, obstacles, boundary)) {
                continue;
            }
            const cost = segmentCost(first, corner, occupied) + segmentCost(corner, last, occupied);
            if (cost < bestCost) {
                bestCost = cost;
                best = path;
            }
        }
    }
    return best;
}

// 对坐标排序，用芯片边缘、端点和间距形成可走的通道
function compareCoordinates(first, last) {
    return first - last;
}

// 将一个点加入可见图，忽略画布外或芯片内部的点
function addPoint(graph, x, y) {
    const point = { x: x, y: y, id: graph.points.length, links: [] };
    if (!allowedPath([point], graph.obstacles, graph.boundary)) {
        return;
    }
    for (const obstacle of graph.obstacles) {
        if (x > obstacle.x && x < obstacle.x + obstacle.width && y > obstacle.y && y < obstacle.y + obstacle.height) {
            return;
        }
    }
    const key = x + ":" + y;
    if (!graph.positions.has(key)) {
        graph.positions.set(key, point);
        graph.points.push(point);
    }
}

// 将点按横线与竖线分组，每组只连接相邻且没有障碍的点
function groupPoints(graph, family) {
    const groups = new Map();
    for (const point of graph.points) {
        let key = point.y;
        if (family === 1) {
            key = point.x;
        }
        const groupKey = key.toFixed(ROUTE_COST.coordinateDigits);
        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey).push(point);
    }
    for (const points of groups.values()) {
        points.sort(comparePoints);
        for (let index = 1; index < points.length; index = index + 1) {
            const first = points[index - 1];
            const last = points[index];
            if (lineDirection(first, last) < 0 || !allowedPath([first, last], graph.obstacles, graph.boundary)) {
                continue;
            }
            const cost = segmentCost(first, last, graph.occupied);
            graph.maximumCost = Math.max(graph.maximumCost, cost);
            first.links.push({ point: last, cost: cost });
            last.links.push({ point: first, cost: cost });
        }
    }
}

// 按坐标排序同一直线上的点，竖直线按纵坐标排序
function comparePoints(first, last) {
    if (first.x !== last.x) {
        return first.x - last.x;
    }
    return first.y - last.y;
}

// 建立稀疏通道图，端点使用原始小数坐标，不吸附到网格
function createGraph(first, last, obstacles, occupied, boundary) {
    const graph = {
        points: [], positions: new Map(), states: new Map(), dirtyNodes: [],
        obstacles: obstacles, occupied: occupied, boundary: boundary, maximumCost: 0,
        neighbors: neighbors, cleanDirty: pathfinding.Graph.prototype.cleanDirty, markDirty: pathfinding.Graph.prototype.markDirty
    };
    const horizontal = new Set([first.x, last.x, boundary.x, boundary.right]);
    const vertical = new Set([first.y, last.y, boundary.y, boundary.bottom]);
    for (const obstacle of obstacles) {
        for (const offset of [-ROUTE_COST.clearance, 0, ROUTE_COST.clearance]) {
            horizontal.add(obstacle.x + offset);
            horizontal.add(obstacle.x + obstacle.width + offset);
            vertical.add(obstacle.y + offset);
            vertical.add(obstacle.y + obstacle.height + offset);
        }
    }
    // 给已有导线两边各留一个候选通道，拐角相同的线路才比较这些通道
    for (const segment of occupied) {
        for (const point of [segment.first, segment.last]) {
            horizontal.add(point.x - ROUTE_COST.clearance);
            horizontal.add(point.x + ROUTE_COST.clearance);
            vertical.add(point.y - ROUTE_COST.clearance);
            vertical.add(point.y + ROUTE_COST.clearance);
        }
    }
    const columns = Array.from(horizontal);
    const rows = Array.from(vertical);
    columns.sort(compareCoordinates);
    rows.sort(compareCoordinates);
    for (const x of columns) {
        for (const y of rows) {
            addPoint(graph, x, y);
        }
    }
    for (let family = 0; family < 2; family = family + 1) {
        groupPoints(graph, family);
    }
    // 一条最优路径不会重复同一方向状态，全部次要代价之和严格小于一个拐角
    graph.secondaryScale = (graph.points.length * DIRECTIONS.length + 2) * (graph.maximumCost + 1);
    graph.target = graph.positions.get(last.x + ":" + last.y);
    const start = graph.positions.get(first.x + ":" + first.y);
    if (start && graph.target) {
        graph.goal = routeState(graph, graph.target, -2);
        graph.start = routeState(graph, start, -1);
    }
    return graph;
}

// 同一位置按到达方向建立独立状态，防止少拐角路线被另一方向覆盖
function routeState(graph, point, direction) {
    const key = point.id + ":" + direction;
    if (!graph.states.has(key)) {
        const state = { point: point, direction: direction, graph: graph, getCost: stateCost, isWall: isWall };
        pathfinding.astar.cleanNode(state);
        graph.states.set(key, state);
    }
    return graph.states.get(key);
}

// 图中的节点已经排除芯片内部，因此无需再作为墙处理
function isWall() {
    return false;
}

// 寻路库调用此函数展开下一方向，到达终点后转入统一的结束状态
function neighbors(state) {
    if (state.direction === -2) {
        return [];
    }
    if (state.point === this.target) {
        return [this.goal];
    }
    const result = [];
    for (const link of state.point.links) {
        const direction = lineDirection(state.point, link.point);
        result.push(routeState(this, link.point, direction));
    }
    return result;
}

// 每次改变方向计一个拐角，长度和重叠仅作为严格小于一的次要代价
function stateCost(previous) {
    if (this.direction === -2) {
        return 0;
    }
    let turns = 0;
    if (previous.direction >= 0 && previous.direction !== this.direction) {
        turns = 1;
    }
    for (const link of previous.point.links) {
        if (link.point === this.point) {
            return turns + link.cost / this.graph.secondaryScale;
        }
    }
    throw new Error("走线通道不连续");
}

// 使用零启发值让成熟寻路库按真实代价搜索，避免估计值改变拐角优先级
function zeroHeuristic() {
    return 0;
}

// 返回少拐角且不穿过芯片的路径，拐角相同时再比较重叠、间距和长度
export function findRoute(first, last, obstacles, occupied, boundary) {
    const simple = simpleRoute(first, last, obstacles, occupied, boundary);
    if (simple.length > 0) {
        return simple;
    }
    const graph = createGraph(first, last, obstacles, occupied, boundary);
    if (!graph.start || !graph.goal) {
        return [];
    }
    const states = pathfinding.astar.search(graph, graph.start, graph.goal, { heuristic: zeroHeuristic });
    if (states.length === 0) {
        return [];
    }
    const points = [first];
    for (const state of states) {
        points.push(state.point);
    }
    return simplifyWirePath(points);
}
