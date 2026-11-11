import pathfinding from "javascript-astar";
import { BOARD, endpointPosition } from "./board.mjs";
import { chipBounds } from "./geometry.mjs";
import { LIMITS } from "./storage.mjs";

const ROUTING = { step: 6, margin: 6, topBoundary: 62, bottomBoundary: 1110, sharedCost: 70, crossingCost: 10, neighborCost: 3, turnCost: 3 };
const width = Math.floor(BOARD.width / ROUTING.step) + 1;
const height = Math.floor(BOARD.height / ROUTING.step) + 1;

// 将端点换算为寻路网格位置，实际电气端点保持原坐标
function gridPoint(point) {
    return { x: Math.round(point.x / ROUTING.step), y: Math.round(point.y / ROUTING.step) };
}

// 生成芯片禁入区域，导线可以使用芯片周围的空孔和通道
function createWalls(project) {
    const walls = new Set();
    for (const chip of project.chips) {
        const bounds = chipBounds(chip);
        for (let column = 0; column < width; column = column + 1) {
            for (let row = 0; row < height; row = row + 1) {
                const horizontal = column * ROUTING.step;
                const vertical = row * ROUTING.step;
                if (horizontal >= bounds.x - ROUTING.margin && horizontal <= bounds.x + bounds.width + ROUTING.margin && vertical >= bounds.y - ROUTING.margin && vertical <= bounds.y + bounds.height + ROUTING.margin) {
                    walls.add(column + ":" + row);
                }
            }
        }
    }
    return walls;
}

// 寻路库用网格节点作为 this 调用本函数，按导线占用方向增加代价
function routeCost(previous) {
    let cost = this.weight;
    const horizontal = this.y === previous.y;
    if (horizontal) {
        cost = cost + this.horizontalUse * ROUTING.sharedCost + this.verticalUse * ROUTING.crossingCost;
    } else {
        cost = cost + this.verticalUse * ROUTING.sharedCost + this.horizontalUse * ROUTING.crossingCost;
    }
    if (previous.parent) {
        const wasHorizontal = previous.y === previous.parent.y;
        if (wasHorizontal !== horizontal) {
            cost = cost + ROUTING.turnCost;
        }
    }
    return cost;
}

// 为一根导线创建带占用权重的网格，避免把多根线压在同一条路径上
function createGraph(walls, occupied, first, last) {
    const weights = [];
    for (let column = 0; column < width; column = column + 1) {
        const cells = [];
        for (let row = 0; row < height; row = row + 1) {
            let weight = 1;
            const key = column + ":" + row;
            const vertical = row * ROUTING.step;
            const top = Math.min(ROUTING.topBoundary, first.y * ROUTING.step, last.y * ROUTING.step);
            const bottom = Math.max(ROUTING.bottomBoundary, first.y * ROUTING.step, last.y * ROUTING.step);
            if (walls.has(key) || column < 4 || column > width - 4 || vertical < top || vertical > bottom) {
                weight = 0;
            }
            cells.push(weight);
        }
        weights.push(cells);
    }
    weights[first.x][first.y] = 1;
    weights[last.x][last.y] = 1;
    const graph = new pathfinding.Graph(weights);
    for (let column = 0; column < width; column = column + 1) {
        for (let row = 0; row < height; row = row + 1) {
            const cell = graph.grid[column][row];
            const key = column + ":" + row;
            const usage = occupied.get(key);
            cell.horizontalUse = 0;
            cell.verticalUse = 0;
            if (usage) {
                cell.horizontalUse = usage.horizontal;
                cell.verticalUse = usage.vertical;
            }
            for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                if (occupied.has((column + offset[0]) + ":" + (row + offset[1])) && cell.weight !== 0) {
                    cell.weight = cell.weight + ROUTING.neighborCost;
                }
            }
            cell.getCost = routeCost;
        }
    }
    return graph;
}

// 记录已经布好的导线方向，后续导线尽量选择其他空闲通道
function markPath(points, occupied) {
    for (let index = 1; index < points.length; index = index + 1) {
        const first = points[index - 1];
        const last = points[index];
        const horizontal = first.y === last.y;
        for (const point of [first, last]) {
            const key = point.x + ":" + point.y;
            let usage = occupied.get(key);
            if (!usage) {
                usage = { horizontal: 0, vertical: 0 };
                occupied.set(key, usage);
            }
            if (horizontal) {
                usage.horizontal = usage.horizontal + 1;
            } else {
                usage.vertical = usage.vertical + 1;
            }
        }
    }
}

// 移除直线段上的中间点，只保留正交拐角和两端的准确坐标
function simplifyPath(points) {
    const simplified = [];
    for (const point of points) {
        if (simplified.length > 0) {
            const previous = simplified[simplified.length - 1];
            if (previous.x === point.x && previous.y === point.y) {
                continue;
            }
        }
        while (simplified.length >= 2) {
            const previous = simplified[simplified.length - 1];
            const before = simplified[simplified.length - 2];
            const vertical = before.x === previous.x && previous.x === point.x;
            const horizontal = before.y === previous.y && previous.y === point.y;
            if (!vertical && !horizontal) {
                break;
            }
            simplified.pop();
        }
        simplified.push({ x: point.x, y: point.y });
    }
    return simplified;
}

// 短导线先布，给局部连接保留直接路径；长导线随后避开占用区域
function compareLength(first, second) {
    return first.length - second.length;
}

// 把执行权交还浏览器，让较大的电路在整理过程中仍能刷新界面
function yieldRouting(resolve) {
    setTimeout(resolve, 0);
}

// 为当前电路生成路径表，全部成功后才返回，不修改原电路的任何字段
export async function routeWires(project) {
    const walls = createWalls(project);
    const occupied = new Map();
    const ordered = [];
    for (const wire of project.wires) {
        const first = endpointPosition(wire.from);
        const last = endpointPosition(wire.to);
        ordered.push({ wire: wire, first: first, last: last, length: Math.abs(first.x - last.x) + Math.abs(first.y - last.y) });
    }
    ordered.sort(compareLength);
    const routes = {};
    for (const entry of ordered) {
        const first = gridPoint(entry.first);
        const last = gridPoint(entry.last);
        const graph = createGraph(walls, occupied, first, last);
        const path = pathfinding.astar.search(graph, graph.grid[first.x][first.y], graph.grid[last.x][last.y]);
        if (path.length === 0 && (first.x !== last.x || first.y !== last.y)) {
            throw new Error("找不到导线路径：" + entry.wire.id);
        }
        const cells = [first];
        const points = [entry.first, { x: first.x * ROUTING.step, y: entry.first.y }];
        points.push({ x: first.x * ROUTING.step, y: first.y * ROUTING.step });
        for (const cell of path) {
            cells.push({ x: cell.x, y: cell.y });
            points.push({ x: cell.x * ROUTING.step, y: cell.y * ROUTING.step });
        }
        points.push({ x: last.x * ROUTING.step, y: entry.last.y }, entry.last);
        const simplified = simplifyPath(points);
        const bends = simplified.slice(1, -1);
        // 空转折点会触发画布的默认折线，直线也保留一个中点以固定路径
        if (bends.length === 0) {
            bends.push({ x: (entry.first.x + entry.last.x) / 2, y: (entry.first.y + entry.last.y) / 2 });
        }
        if (bends.length > LIMITS.bends) {
            throw new Error("导线路径拐角过多：" + entry.wire.id);
        }
        routes[entry.wire.id] = bends;
        markPath(cells, occupied);
        await new Promise(yieldRouting);
    }
    return routes;
}
