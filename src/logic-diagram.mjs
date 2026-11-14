import { CHIP_MODELS } from "./chips.mjs";
import { buildTopology, nodeFor, readEndpoint } from "./engine.mjs";
import { IO_LIMIT, pinHole, portHole, endpointLabel } from "./board.mjs";

// IEC 矩形逻辑符号与现有门类型对应，不重新推测芯片内部接法
const GATE_SYMBOLS = { xor: "=1", and: "&", or: "≥1", nand: "&", not: "1" };
// 复杂芯片方框内标出功能，物理脚名继续从原芯片模型读取
const FUNCTION_SYMBOLS = {
    "74LS273": "REG",
    "74LS283": "Σ",
    "74LS138": "DEC",
    "74LS139": "DEC",
    "74LS151": "MUX",
    "74LS153": "MUX",
    "74LS85": "COMP",
    "74LS48": "BCD",
    "74LS74": "D",
    "74LS112": "JK",
    "CD4027": "JK",
    "74LS160": "CTR",
    "74LS161": "CTR",
    "74LS194": "SRG"
};

// 从独立的连通图收集端点，生成逻辑图不会改动仿真历史
function addTerminal(context, endpoint, label, direction, owner, pin) {
    const root = nodeFor(context.topology, endpoint);
    if (!context.networks.has(root)) {
        context.networks.set(root, { root: root, members: [], wireCount: 0, pullUps: [] });
    }
    const network = context.networks.get(root);
    const terminal = {
        id: owner + "-pin-" + pin,
        owner: owner,
        pin: pin,
        endpoint: endpoint,
        label: label,
        direction: direction,
        root: root,
        level: readEndpoint(context.result, endpoint)
    };
    network.members.push(terminal);
    context.terminals.set(terminal.id, terminal);
    return terminal;
}

// 判断一个物理脚的输入输出方向，双向脚只登记一次
function pinDirection(model, pin) {
    if (model.outputs.includes(pin)) {
        if (model.inputs.includes(pin)) {
            return "bidirectional";
        }
        return "output";
    }
    return "input";
}

// 登记板载按键、脉冲、电源和 LED，每个端口仍按实际板内铜排连通
function collectBoardPorts(context) {
    const names = ["VCC", "GND", "P+", "P-"];
    for (let bit = 0; bit < IO_LIMIT; bit = bit + 1) {
        names.push("K" + bit, "L" + bit);
    }
    for (const name of names) {
        let direction = "output";
        let label = name;
        if (name.startsWith("L")) {
            direction = "input";
            label = name + " LED";
        } else if (name.startsWith("K")) {
            label = name + " 按键";
        } else if (name === "VCC") {
            label = "+5V";
        } else if (name === "P-") {
            label = "P−";
        }
        const terminal = addTerminal(context, portHole(name), label, direction, name, 0);
        context.boardPorts.push({ id: name, title: label, terminal: terminal });
    }
}

// 采集芯片的真实物理脚，电源脚与 NC 记录在封装说明中
function collectChipPins(context, chip) {
    const model = CHIP_MODELS[chip.model];
    const pins = [];
    for (let pin = 1; pin <= model.count; pin = pin + 1) {
        if (model.labels[pin] === "NC") {
            continue;
        }
        const label = chip.id + " · " + pin + "脚 " + model.labels[pin];
        const direction = pinDirection(model, pin);
        const terminal = addTerminal(context, pinHole(chip, pin), label, direction, chip.id, pin);
        terminal.name = model.labels[pin];
        terminal.power = pin === model.power || pin === model.ground;
        pins.push(terminal);
    }
    return pins;
}

// 从封装脚表取指定脚，门电路直接复用芯片模型中的 gates 数组
function gateTerminals(pins, gate) {
    const terminals = [];
    const seen = new Set();
    for (const pin of gate) {
        if (seen.has(pin)) {
            continue;
        }
        seen.add(pin);
        for (const terminal of pins) {
            if (terminal.pin === pin) {
                terminals.push(terminal);
            }
        }
    }
    return terminals;
}

// 普通逻辑门拆成独立门，寄存器、加法器等保留为有引脚名的功能块
function collectChipBlocks(context, chip) {
    const model = CHIP_MODELS[chip.model];
    const pins = collectChipPins(context, chip);
    const powerPins = [];
    const signalPins = [];
    for (const terminal of pins) {
        if (terminal.power) {
            powerPins.push(terminal);
        } else {
            signalPins.push(terminal);
        }
    }
    if (model.gates) {
        let symbol = GATE_SYMBOLS[model.operation];
        if (!symbol) {
            symbol = "&";
        }
        if (model.kind === "tristate") {
            symbol = "BUF";
        }
        for (let index = 0; index < model.gates.length; index = index + 1) {
            const gate = model.gates[index];
            const inverted = model.operation === "nand" || model.operation === "not" ||
                model.kind === "open-collector" || model.kind === "nand4" || model.kind === "cmos-nand";
            context.blocks.push({
                id: chip.id + "-gate-" + (index + 1),
                chipId: chip.id,
                title: chip.id + "." + (index + 1),
                subtitle: chip.model,
                symbol: symbol,
                inverted: inverted,
                terminals: gateTerminals(pins, gate),
                powerPins: powerPins
            });
        }
    } else {
        context.blocks.push({
            id: chip.id,
            chipId: chip.id,
            title: chip.id + " · " + chip.model,
            subtitle: model.title,
            symbol: "",
            functionSymbol: FUNCTION_SYMBOLS[chip.model],
            inverted: false,
            terminals: signalPins,
            powerPins: powerPins
        });
    }
}

// 只保留实际接线或多个端点共享的网络，裸导线也保留孔位端点
function collectNetworks(context, project) {
    for (const wire of project.wires) {
        const root = nodeFor(context.topology, wire.from);
        if (!context.networks.has(root)) {
            context.networks.set(root, { root: root, members: [], wireCount: 0, pullUps: [], holesOnly: true });
        }
        const network = context.networks.get(root);
        network.wireCount = network.wireCount + 1;
        if (network.holesOnly) {
            addTerminal(context, wire.from, endpointLabel(wire.from), "bidirectional", wire.id + "-from", 0);
            addTerminal(context, wire.to, endpointLabel(wire.to), "bidirectional", wire.id + "-to", 0);
        }
    }
    for (const endpoint of project.pullUps) {
        const root = nodeFor(context.topology, endpoint);
        if (!context.networks.has(root)) {
            addTerminal(context, endpoint, endpointLabel(endpoint), "bidirectional", "pullup-" + root, 0);
        }
        context.networks.get(root).pullUps.push(endpoint);
    }
    const nets = [];
    for (const network of context.networks.values()) {
        if (network.members.length < 2 && network.wireCount === 0 && network.pullUps.length === 0) {
            continue;
        }
        network.id = "N" + (nets.length + 1);
        network.level = network.members[0].level;
        network.rail = "";
        for (const terminal of network.members) {
            terminal.netId = network.id;
            if (terminal.owner === "VCC" || terminal.owner === "GND") {
                if (network.rail !== "") {
                    network.rail = "+5V / GND";
                } else if (terminal.owner === "VCC") {
                    network.rail = "+5V";
                } else {
                    network.rail = "GND";
                }
            }
        }
        nets.push(network);
    }
    return nets;
}

// 从当前工程生成只读逻辑图模型，保留输入输出方向和每条网络的完整端点
export function buildLogicDiagram(project, result) {
    const context = {
        topology: buildTopology(project),
        result: { topology: structuredClone(result.topology), values: result.values },
        networks: new Map(),
        terminals: new Map(),
        boardPorts: [],
        blocks: []
    };
    collectBoardPorts(context);
    for (const chip of project.chips) {
        collectChipBlocks(context, chip);
    }
    const nets = collectNetworks(context, project);
    const floatingInputs = [];
    for (const terminal of context.terminals.values()) {
        if (terminal.pin > 0 && !terminal.power && terminal.direction !== "output" && terminal.level === "Z") {
            floatingInputs.push(terminal);
        }
    }
    return { nets: nets, blocks: context.blocks, boardPorts: context.boardPorts, floatingInputs: floatingInputs };
}
