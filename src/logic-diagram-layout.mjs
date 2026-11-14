import ELK from "elkjs/lib/elk.bundled.js";

// 引脚行距和功能块尺寸以图纸像素为单位，布局只决定阅读位置
export const LOGIC_LAYOUT = {
    blockWidth: 248,
    gateWidth: 108,
    top: 26,
    row: 22,
    pinPadding: 14,
    lead: 24,
    minimumBodyHeight: 42,
    bottom: 22,
    portSize: 4
};
// ELK 官方分层算法负责自动摆放、正交连线和反馈边，不参与逻辑计算
const LAYOUT_OPTIONS = {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.padding": "[top=38,left=38,bottom=38,right=38]",
    "elk.spacing.nodeNode": "48",
    "elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "elk.layered.spacing.edgeNodeBetweenLayers": "32",
    "elk.spacing.edgeEdge": "16",
    "elk.layered.mergeEdges": "true",
    "elk.layered.nodePlacement.favorStraightEdges": "true",
    "elk.layered.unnecessaryBendpoints": "false",
    "elk.randomSeed": "1"
};
// 仅比较两种官方分层方式，沿用同一 ELK 算法，不另写寻路或改动引脚
const LAYERING_STRATEGIES = ["NETWORK_SIMPLEX", "LONGEST_PATH_SOURCE"];
// ELK 浮点坐标只在这个容差内视为重合，实际转角按方向变化计数
const COORDINATE_TOLERANCE = 0.000001;
let layoutEngine = null;

// 固定引脚位置，输入在左、输出在右，侧边文字与物理脚号一一对应
function layoutPort(terminal, width, vertical, output) {
    let horizontal = -LOGIC_LAYOUT.portSize / 2;
    if (output) {
        horizontal = width - LOGIC_LAYOUT.portSize / 2;
    }
    return {
        id: terminal.id,
        width: LOGIC_LAYOUT.portSize,
        height: LOGIC_LAYOUT.portSize,
        x: horizontal,
        y: vertical - LOGIC_LAYOUT.portSize / 2,
        terminal: terminal
    };
}

// 为一个芯片或门建立布局节点，未接输出仍保留引脚
function blockNode(block) {
    let width = LOGIC_LAYOUT.blockWidth;
    if (block.symbol !== "") {
        width = LOGIC_LAYOUT.gateWidth;
    }
    const ports = [];
    let inputs = 0;
    let outputs = 0;
    for (const terminal of block.terminals) {
        if (terminal.direction === "output") {
            outputs = outputs + 1;
        } else {
            inputs = inputs + 1;
        }
    }
    const rows = Math.max(inputs, outputs);
    const bodyHeight = Math.max(LOGIC_LAYOUT.minimumBodyHeight, (rows - 1) * LOGIC_LAYOUT.row + LOGIC_LAYOUT.pinPadding * 2);
    let inputIndex = 0;
    let outputIndex = 0;
    for (const terminal of block.terminals) {
        const output = terminal.direction === "output";
        let index = inputIndex;
        let count = inputs;
        if (output) {
            index = outputIndex;
            count = outputs;
            outputIndex = outputIndex + 1;
        } else {
            inputIndex = inputIndex + 1;
        }
        let vertical = LOGIC_LAYOUT.top + bodyHeight / 2;
        if (count > 1) {
            vertical = LOGIC_LAYOUT.top + LOGIC_LAYOUT.pinPadding +
                index * (bodyHeight - LOGIC_LAYOUT.pinPadding * 2) / (count - 1);
        }
        ports.push(layoutPort(terminal, width, Math.round(vertical), output));
    }
    const height = LOGIC_LAYOUT.top + bodyHeight + LOGIC_LAYOUT.bottom;
    return {
        id: block.id,
        width: width,
        height: height,
        ports: ports,
        block: block,
        body: { x: LOGIC_LAYOUT.lead, y: LOGIC_LAYOUT.top, width: width - LOGIC_LAYOUT.lead * 2, height: bodyHeight },
        layoutOptions: { "elk.portConstraints": "FIXED_POS" }
    };
}

// 板载信号只在实际连入电路时显示，方向约束让按键在左、LED 在右
function boardNode(port) {
    const output = port.terminal.direction === "output";
    const width = 98;
    let horizontal = 0;
    let layer = "LAST";
    if (output) {
        horizontal = width;
        layer = "FIRST";
    }
    return {
        id: "board-" + port.id,
        width: width,
        height: 44,
        boardPort: port,
        ports: [{ id: port.terminal.id, width: 4, height: 4, x: horizontal - 2, y: 20, terminal: port.terminal }],
        layoutOptions: { "elk.portConstraints": "FIXED_POS", "elk.layered.layering.layerConstraint": layer }
    };
}

// 将一条网络接到全部显示端点，多驱动网络仍保留所有输出端，不能静默丢弃
function addNetworkEdges(graph, network, visible) {
    const members = [];
    const drivers = [];
    for (const terminal of network.members) {
        if (visible.has(terminal.id)) {
            members.push(terminal);
            if (terminal.direction === "output") {
                drivers.push(terminal);
            }
        }
    }
    if (members.length < 2) {
        return;
    }
    let source = members[0];
    if (drivers.length > 0) {
        source = drivers[0];
    }
    // 边方向只服务于排版，不表示三态或 OC 网络的实际电流方向
    for (const terminal of members) {
        if (terminal.id === source.id) {
            continue;
        }
        graph.edges.push({
            id: network.id + "-" + graph.edges.length,
            sources: [source.id],
            targets: [terminal.id],
            netId: network.id
        });
    }
}

// 创建 ELK 图结构，默认将电源网络改用同名标签，供电脚仍可在核对表查阅
export function createLogicGraph(diagram, showPower = false) {
    const byRoot = new Map();
    for (const network of diagram.nets) {
        byRoot.set(network.root, network);
    }
    const graph = { id: "logic", layoutOptions: LAYOUT_OPTIONS, children: [], edges: [] };
    const visible = new Set();
    const boardOwners = new Set();
    for (const port of diagram.boardPorts) {
        boardOwners.add(port.id);
    }
    for (const block of diagram.blocks) {
        const node = blockNode(block);
        graph.children.push(node);
        for (const port of node.ports) {
            visible.add(port.id);
        }
        if (showPower && !visible.has(block.powerPins[0].id)) {
            const powerBlock = {
                id: block.chipId + "-power",
                title: block.chipId + " 供电",
                subtitle: "电源引脚",
                symbol: "",
                terminals: block.powerPins,
                powerPins: []
            };
            const powerNode = blockNode(powerBlock);
            graph.children.push(powerNode);
            for (const port of powerNode.ports) {
                visible.add(port.id);
            }
        }
    }
    for (const port of diagram.boardPorts) {
        const network = byRoot.get(port.terminal.root);
        if (!network || (!showPower && network.rail !== "")) {
            continue;
        }
        const node = boardNode(port);
        graph.children.push(node);
        visible.add(port.terminal.id);
    }
    for (const network of diagram.nets) {
        for (const terminal of network.members) {
            if (terminal.pin === 0 && !visible.has(terminal.id) && !boardOwners.has(terminal.owner)) {
                const looseNode = boardNode({ id: terminal.owner, title: terminal.label, terminal: terminal });
                graph.children.push(looseNode);
                visible.add(terminal.id);
            }
        }
        if (showPower || network.rail === "") {
            addNetworkEdges(graph, network, visible);
        }
    }
    return graph;
}

// 统计真实转角和折线总长度，共线的中间点不增加拐角数
export function logicDiagramMetrics(graph) {
    let bends = 0;
    let length = 0;
    for (const edge of graph.edges) {
        for (const section of edge.sections) {
            const points = [section.startPoint];
            for (const point of section.bendPoints || []) {
                points.push(point);
            }
            points.push(section.endPoint);
            let previous = "";
            for (let index = 1; index < points.length; index = index + 1) {
                const horizontal = Math.abs(points[index].x - points[index - 1].x);
                const vertical = Math.abs(points[index].y - points[index - 1].y);
                if (horizontal + vertical <= COORDINATE_TOLERANCE) {
                    continue;
                }
                let direction = "horizontal";
                if (horizontal <= COORDINATE_TOLERANCE) {
                    direction = "vertical";
                }
                if (previous !== "" && previous !== direction) {
                    bends = bends + 1;
                }
                previous = direction;
                length = length + horizontal + vertical;
            }
        }
    }
    return { bends: bends, length: length };
}

// 调用现成布局引擎，返回包含节点坐标、折线与交点的图纸数据
export async function layoutLogicDiagram(diagram, showPower = false) {
    if (!layoutEngine) {
        layoutEngine = new ELK();
    }
    let best = null;
    let bestMetrics = null;
    for (const strategy of LAYERING_STRATEGIES) {
        const graph = createLogicGraph(diagram, showPower);
        if (graph.children.length === 0) {
            return { id: graph.id, width: 400, height: 140, children: [], edges: [] };
        }
        graph.layoutOptions = Object.assign({}, LAYOUT_OPTIONS);
        graph.layoutOptions["elk.layered.layering.strategy"] = strategy;
        const candidate = await layoutEngine.layout(graph);
        const metrics = logicDiagramMetrics(candidate);
        const fewerBends = bestMetrics && metrics.bends < bestMetrics.bends;
        const shorter = bestMetrics && metrics.bends === bestMetrics.bends && metrics.length < bestMetrics.length;
        if (!best || fewerBends || shorter) {
            best = candidate;
            bestMetrics = metrics;
        }
    }
    return best;
}
