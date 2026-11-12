import { BOARD, endpointPosition } from "./board.mjs";
import { chipBounds, wirePoints } from "./geometry.mjs";
import { LIMITS } from "./storage.mjs";
import { simplifyWirePath, shortCornerPath, segmentCrossesBounds } from "./wire-path.mjs";
import { initializeRouting } from "./routing-runtime.mjs";

// libavoid 的代价是相对权重，间距和避让距离以画布逻辑像素计算
const ROUTING = {
    segmentPenalty: 50,
    shapeBuffer: 5,
    nudgingDistance: 6,
    bottomBoundary: 1110,
    boundaryDepth: 1000
};

// 把画布刷新机会交还浏览器，让等待提示先显示出来
function yieldFrame(resolve) {
    setTimeout(resolve, 0);
}

// 创建正交布线器，线间距由 libavoid 本身处理，不在显示层另加偏移
function createRouter(Avoid) {
    const router = new Avoid.Router(Avoid.RouterFlag.OrthogonalRouting.value);
    const parameter = Avoid.RoutingParameter;
    router.setRoutingParameter(parameter.segmentPenalty, ROUTING.segmentPenalty);
    router.setRoutingParameter(parameter.shapeBufferDistance, ROUTING.shapeBuffer);
    router.setRoutingParameter(parameter.idealNudgingDistance, ROUTING.nudgingDistance);
    router.setRoutingOption(Avoid.RoutingOption.nudgeOrthogonalTouchingColinearSegments, true);
    router.setRoutingOption(Avoid.RoutingOption.nudgeSharedPathsWithCommonEndPoint, true);
    router.setRoutingOption(Avoid.RoutingOption.nudgeOrthogonalSegmentsConnectedToShapes, true);
    return router;
}

// 给原生对象建立释放清单，Router 销毁后再释放借给它的临时坐标与端点
function keepObject(objects, value) {
    objects.push(value);
    return value;
}

// 添加芯片障碍，另外用四个边界矩形将导线限制在画布内
function addObstacles(Avoid, router, project, objects) {
    const bounds = [];
    for (const chip of project.chips) {
        bounds.push(chipBounds(chip));
    }
    let bottom = ROUTING.bottomBoundary;
    for (const wire of project.wires) {
        bottom = Math.max(bottom, endpointPosition(wire.from).y, endpointPosition(wire.to).y);
    }
    const depth = ROUTING.boundaryDepth;
    const walls = [
        { x: -depth, y: -depth, width: depth, height: BOARD.height + depth * 2 },
        { x: BOARD.width, y: -depth, width: depth, height: BOARD.height + depth * 2 },
        { x: 0, y: -depth, width: BOARD.width, height: depth },
        { x: 0, y: bottom + ROUTING.shapeBuffer, width: BOARD.width, height: depth }
    ];
    const obstacles = bounds.concat(walls);
    for (const obstacle of obstacles) {
        const first = keepObject(objects, new Avoid.Point(obstacle.x, obstacle.y));
        const last = keepObject(objects, new Avoid.Point(obstacle.x + obstacle.width, obstacle.y + obstacle.height));
        const rectangle = keepObject(objects, new Avoid.Rectangle(first, last));
        new Avoid.ShapeRef(router, rectangle);
    }
    return bounds;
}

// 手动转折点作为必经点；逐根接线时也固定其他导线的原路径
function addCheckpoints(Avoid, connection, points, objects) {
    if (points.length === 0) {
        return;
    }
    const vector = keepObject(objects, new Avoid.CheckpointVector());
    for (const location of points) {
        const point = keepObject(objects, new Avoid.Point(location.x, location.y));
        const checkpoint = keepObject(objects, new Avoid.Checkpoint(point));
        vector.push_back(checkpoint);
    }
    connection.setRoutingCheckpoints(vector);
}

// 把每根线的真实插孔注册给引擎，返回导线编号对应的原生连接对象
function addConnections(Avoid, router, project, targetId, objects) {
    const connections = new Map();
    for (let index = 0; index < project.wires.length; index = index + 1) {
        const wire = project.wires[index];
        const first = endpointPosition(wire.from);
        const last = endpointPosition(wire.to);
        const sourcePoint = keepObject(objects, new Avoid.Point(first.x, first.y));
        const targetPoint = keepObject(objects, new Avoid.Point(last.x, last.y));
        const source = keepObject(objects, new Avoid.ConnEnd(sourcePoint));
        const target = keepObject(objects, new Avoid.ConnEnd(targetPoint));
        const connection = new Avoid.ConnRef(router, source, target);
        connection.setRoutingType(Avoid.ConnType.ConnType_Orthogonal);
        if (targetId !== "") {
            let checkpoints = wire.bends;
            if (wire.id !== targetId) {
                checkpoints = wirePoints(wire, index).slice(1, -1);
            }
            addCheckpoints(Avoid, connection, checkpoints, objects);
        }
        connections.set(wire.id, connection);
    }
    return connections;
}

// 在释放原生路径前复制坐标，随后核对准确端点及芯片避让
function readRoute(connection, wire, bounds) {
    const route = connection.displayRoute();
    const points = [];
    try {
        for (let index = 0; index < route.size(); index = index + 1) {
            const point = route.at(index);
            points.push({ x: point.x, y: point.y });
            point.delete();
        }
    } finally {
        route.delete();
    }
    if (points.length < 2) {
        throw new Error("未生成有效走线：" + wire.id);
    }
    const first = endpointPosition(wire.from);
    const last = endpointPosition(wire.to);
    // 原生错开会平移端部线段，将其接回精确插孔后再核对整条真实路径
    const source = points[0];
    const target = points[points.length - 1];
    if (source.x !== first.x && source.y !== first.y) {
        points.unshift({ x: source.x, y: first.y });
    }
    points.unshift(first);
    if (target.x !== last.x && target.y !== last.y) {
        points.push({ x: target.x, y: last.y });
    }
    points.push(last);
    for (let index = 1; index < points.length; index = index + 1) {
        for (const obstacle of bounds) {
            if (segmentCrossesBounds(points[index - 1], points[index], obstacle)) {
                throw new Error("走线穿过芯片，请调整转折点：" + wire.id);
            }
        }
    }
    return simplifyWirePath(points);
}

// 批量与单线调用同一个引擎，所有路径成功后才返回，原实验始终不改动
async function routeProject(project, angle, targetId) {
    await new Promise(yieldFrame);
    const Avoid = await initializeRouting();
    const router = createRouter(Avoid);
    const objects = [];
    try {
        const bounds = addObstacles(Avoid, router, project, objects);
        const connections = addConnections(Avoid, router, project, targetId, objects);
        router.processTransaction();
        const routes = {};
        for (const wire of project.wires) {
            if (targetId !== "" && wire.id !== targetId) {
                continue;
            }
            let points = readRoute(connections.get(wire.id), wire, bounds);
            const preserveManualPoints = targetId !== "" && wire.bends.length > 0;
            if (angle === 45 && !preserveManualPoints) {
                points = shortCornerPath(points, bounds, LIMITS.bends + 2);
            }
            const bends = points.slice(1, -1);
            if (bends.length === 0) {
                bends.push({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
            }
            if (bends.length > LIMITS.bends) {
                throw new Error("走线转折点超出上限：" + wire.id);
            }
            routes[wire.id] = bends;
        }
        return routes;
    } finally {
        router.delete();
        for (let index = objects.length - 1; index >= 0; index = index - 1) {
            objects[index].delete();
        }
    }
}

// 使用 libavoid 整理整个实验，保留孔位、芯片位置和所有非路径字段
export function routeWires(project, angle) {
    return routeProject(project, angle, "");
}

// 新线自动避障并参考其他导线，已有线路保持原样，手动节点作为必经点
export async function routeNewWire(project, wire, angle) {
    const candidate = Object.assign({}, project);
    candidate.wires = project.wires.concat([wire]);
    const routes = await routeProject(candidate, angle, wire.id);
    return routes[wire.id];
}
